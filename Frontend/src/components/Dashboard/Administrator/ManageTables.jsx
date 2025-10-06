import NavBar from "../NavBar";
import "./prueba.css";

function ManageTables() {
    return (
        <div className="dashboardMain">
            <NavBar />
            <section className="manage-tables">
                <h2 className="title">Number of Tables by Branch</h2>

                <div className="tables-container">
                    <table className="tables-table">
                        <thead>
                            <tr>
                                <th>Branches</th>
                                <th>Number of Tables</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Central Chapinero</td>
                                <td>30</td>
                            </tr>
                            <tr>
                                <td>Usaquén Norte</td>
                                <td>18</td>
                            </tr>
                            <tr>
                                <td>La 93</td>
                                <td>27</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="title">Define or Update Number of Tables per Branch</h2>

                <form className="branch-form">
                    <div className="inputs">
                        <label for="nameBranch">Name</label>
                        <input type="text" placeholder="Branch name" id="nameBranch" name="nameBranch" />
                    </div>
                    <div className="inputs">
                        <label for="numberTables">Number of Tables</label>
                        <input type="number" placeholder="Enter number" id="numberTables" name="numberTables" />
                    </div>

                    <p className="note">
                        Note: If you reduce the number of tables, the remaining tables will be automatically blocked.
                    </p>

                    <div className="button-row">
                        <button className="save-btn">Save Branch</button>
                        <button type="button" className="cancel-btn">Cancel</button>
                    </div>
                </form>
            </section>
        </div>
    )
}

export default ManageTables;