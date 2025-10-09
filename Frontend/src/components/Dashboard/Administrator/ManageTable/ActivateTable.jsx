function ActivateTable() {
    return (
        <section className="section">
            <h2 className="title">Activate Number of Tables per Branch</h2>
            <form className="form">
                <div className="form-row">
                    <div>
                        <label>Branch</label>
                        <select required>
                            <option value="" disabled selected hidden>Select Branch</option>
                            <option value="sede96">96</option>
                        </select>
                    </div>
                    <div>
                        <label>Number of Tables</label>
                        <input type="number" min="1" step="1" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="button-row">
                        <button type="submit" className="save-btn">Save Changes</button>
                        <button type="button" className="cancel-btn">Cancel</button>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default ActivateTable