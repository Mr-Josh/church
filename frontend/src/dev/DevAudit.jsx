import React, { useEffect, useState } from "react";
import { churchApi } from "../services/churchApi";

export default function DevAudit() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    churchApi.dev
      .audit()
      .then((r) => setEntries(r.data?.entries || []))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div className="dev-page">
      <div className="dev-page-heading">
        <div>
          <span>SECURITY / AUDIT</span>
          <h2>Journal d'administration</h2>
          <p>Les dernières opérations sur les comptes techniques.</p>
        </div>
      </div>
      {error && <div className="dev-error">{error}</div>}
      <div className="dev-panel">
        <div className="dev-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Acteur</th>
                <th>Action</th>
                <th>Cible</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.created_at}</td>
                  <td>{e.actor_email || `#${e.actor_user_id}`}</td>
                  <td>
                    <span className="dev-badge">{e.action}</span>
                  </td>
                  <td>
                    {e.target_email ||
                      (e.target_user_id ? `#${e.target_user_id}` : "—")}
                  </td>
                </tr>
              ))}
              {!entries.length && (
                <tr>
                  <td colSpan="4" className="dev-empty">
                    Aucune opération enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
