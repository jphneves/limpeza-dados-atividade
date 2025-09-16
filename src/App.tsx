import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";

interface QuestionData {
  id: number;
  question: string;
  answer: string;
}

function App() {
  const [userName, setUserName] = useState<string>("");
  const [answers, setAnswers] = useState<QuestionData[]>([
    {
      id: 1,
      question: "O que é a biblioteca pandas?",
      answer: "",
    },
    {
      id: 2,
      question: "Quais são as boas práticas de limpeza de dados?",
      answer: "",
    },
    {
      id: 3,
      question: "Principais problemas que podem ocorrer com dados imprecisos?",
      answer: "",
    },
  ]);

  const formRef = useRef<HTMLDivElement>(null);

  const handleAnswerChange = (id: number, value: string) => {
    setAnswers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, answer: value } : item))
    );
  };

  const exportToPDF = async () => {
    if (!formRef.current) return;

    try {
      // Create a temporary div for PDF content
      const pdfContent = document.createElement("div");
      pdfContent.style.padding = "20px";
      pdfContent.style.fontFamily = "Arial, sans-serif";
      pdfContent.style.backgroundColor = "white";
      pdfContent.style.width = "800px";

      // Add title
      const title = document.createElement("h1");
      title.textContent = "Questionário sobre Limpeza de Dados";
      title.style.textAlign = "center";
      title.style.marginBottom = "15px";
      title.style.color = "#333";
      pdfContent.appendChild(title);

      // Add subtitle
      const subtitle = document.createElement("h2");
      subtitle.textContent = "FAG - Engenharia de Software 6° período";
      subtitle.style.textAlign = "center";
      subtitle.style.marginBottom = "20px";
      subtitle.style.color = "#666";
      subtitle.style.fontSize = "18px";
      subtitle.style.fontWeight = "normal";
      pdfContent.appendChild(subtitle);

      // Add user name if provided
      if (userName.trim()) {
        const nameDiv = document.createElement("div");
        nameDiv.style.textAlign = "center";
        nameDiv.style.marginBottom = "30px";
        nameDiv.style.padding = "15px";
        nameDiv.style.backgroundColor = "#f8f9fa";
        nameDiv.style.border = "1px solid #e9ecef";
        nameDiv.style.borderRadius = "8px";

        const nameLabel = document.createElement("strong");
        nameLabel.textContent = "Nome: ";
        nameLabel.style.color = "#2c3e50";

        const nameText = document.createElement("span");
        nameText.textContent = userName;
        nameText.style.color = "#495057";

        nameDiv.appendChild(nameLabel);
        nameDiv.appendChild(nameText);
        pdfContent.appendChild(nameDiv);
      }

      // Add questions and answers
      answers.forEach((item, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.style.marginBottom = "25px";
        questionDiv.style.pageBreakInside = "avoid";

        const questionTitle = document.createElement("h3");
        questionTitle.textContent = `${index + 1}. ${item.question}`;
        questionTitle.style.color = "#2c3e50";
        questionTitle.style.marginBottom = "10px";

        const answerText = document.createElement("p");
        answerText.textContent = item.answer || "Sem resposta";
        answerText.style.backgroundColor = "#f8f9fa";
        answerText.style.padding = "15px";
        answerText.style.border = "1px solid #e9ecef";
        answerText.style.borderRadius = "5px";
        answerText.style.lineHeight = "1.6";
        answerText.style.minHeight = "60px";

        questionDiv.appendChild(questionTitle);
        questionDiv.appendChild(answerText);
        pdfContent.appendChild(questionDiv);
      });

      // Add footer
      const footer = document.createElement("div");
      footer.style.marginTop = "40px";
      footer.style.textAlign = "center";
      footer.style.fontSize = "12px";
      footer.style.color = "#666";
      footer.textContent = `Gerado em ${new Date().toLocaleDateString(
        "pt-BR"
      )}`;
      pdfContent.appendChild(footer);

      // Temporarily add to DOM
      document.body.appendChild(pdfContent);

      // Convert to canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
      });

      // Remove from DOM
      document.body.removeChild(pdfContent);

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save("questionario-limpeza-dados.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF. Tente novamente.");
    }
  };

  return (
    <div className="app">
      <div className="container" ref={formRef}>
        <h1 className="title">Questionário sobre Limpeza de Dados</h1>
        <h2 className="subtitle">FAG - Engenharia de Software 6° período</h2>

        <div className="name-section">
          <label htmlFor="userName" className="name-label">
            Nome:
          </label>
          <input
            id="userName"
            type="text"
            className="name-input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Digite seu nome completo..."
          />
        </div>

        <div className="questions-container">
          {answers.map((item, index) => (
            <div key={item.id} className="question-block">
              <h3 className="question-title">
                {index + 1}. {item.question}
              </h3>
              <textarea
                className="answer-textarea"
                value={item.answer}
                onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                placeholder="Digite sua resposta aqui..."
                rows={6}
              />
            </div>
          ))}
        </div>

        <div className="export-container">
          <button
            className="export-button"
            onClick={exportToPDF}
            disabled={
              !userName.trim() || answers.every((item) => !item.answer.trim())
            }
          >
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
