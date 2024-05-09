import React from "react";
import "./styles.scss";

function AboutUs() {
  return (
    <div className="about-us-container">
      <h1>O nas</h1>
      <p>
        Jesteśmy zespołem studentów trzeciego roku, pasjonatów nowoczesnych
        technologii i rozwiązań informatycznych. Nasz zespół składa się z
        następujących osób:
      </p>
      <ul className="team-list">
        <li>Julian Zalewski</li>
        <li>Jakub Grzegocki</li>
        <li>Kuba Bigaj</li>
      </ul>
      <p>
        W naszym projekcie wykorzystujemy relacyjną bazę danych{" "}
        <b>PostgreSQL</b>, która zapewnia niezawodność i wydajność dla naszych
        aplikacji. Sama aplikacja webowa została stworzona przy użyciu
        frameworków języka JavaScript: <b>React.js</b>, <b>Express.js</b> oraz{" "}
        <b>Node.js</b> . Jesteśmy zaangażowani w tworzenie oprogramowania, które
        jest nie tylko funkcjonalne, ale też intuicyjne i przyjemne w użyciu.
      </p>
    </div>
  );
}

export default AboutUs;
