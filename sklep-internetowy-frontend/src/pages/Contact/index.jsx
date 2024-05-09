import React from "react";
import "./styles.scss";

function Contact() {
  return (
    <div className="contact-container">
      <h1>Kontakt</h1>
      <p>
        Jeśli masz jakiekolwiek pytania lub potrzebujesz wsparcia, skontaktuj
        się z nami:
      </p>
      <div className="contact-info">
        <p>
          <strong>Email:</strong> 263996@student.pwr.edu.pl
        </p>
        <p>
          <strong>Telefon:</strong> +48 123 456 789
        </p>
        <p>
          <strong>Adres:</strong> Pl. Bema 2, 50-438 Wrocław
        </p>
      </div>
      <div className="social-media">
        <p>Śledź nas również w mediach społecznościowych:</p>
        <ul>
          <li>Facebook</li>
          <li>Twitter</li>
          <li>LinkedIn</li>
        </ul>
      </div>
    </div>
  );
}

export default Contact;
