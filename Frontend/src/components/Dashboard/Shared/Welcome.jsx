import "./Welcome.css";

function Welcome({cargo, sede, usuario}) {
  
  return (
    <div className="welcome-card">
      {/*<div className="user-icon">SA</div>*/}
      <div className="welcome-text">
        <h2>¡Welcome {cargo}!</h2>
        {cargo === "Administrator" ? (
          <p>Hello <span className="highlight">{usuario}</span>, you have full access as{" "}
            <span className="highlight">{cargo}</span>.</p>
        ) : (
          <p>Hello <span className="highlight">{usuario}</span>, you have limited access as{" "}
            <span className="highlight">{cargo}</span> at site.</p>
        )}
      </div>
    </div>
  )
}

export default Welcome;