import React from "react";

export default function Home() {
  return (
    <div className="page home-page" style={{ padding: 20 }}>
      <h1>Home</h1>
      <p>Welcome — this is a placeholder home page.</p>

      <section style={{ marginTop: 16 }}>
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/login">Login</a></li>
          <li><a href="/register">Register</a></li>
        </ul>
      </section>
    </div>
  );
}
