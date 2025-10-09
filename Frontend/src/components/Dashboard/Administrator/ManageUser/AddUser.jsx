function AddUser() {
    return (
        <section className="section">
            <h2 className="title">Add User</h2>
            <form className="form">
                <div className="form-row">
                    <div>
                        <label>ID Type</label>
                        <select required>
                            <option value="" disabled selected hidden>Select ID Type</option>
                            <option value="cedu">nui</option>
                        </select>
                    </div>
                    <div>
                        <label>ID Number</label>
                        <input type="text" />
                    </div>
                </div>

                <div className="form-row">
                    <div>
                        <label>Full Name</label>
                        <input type="text" />
                    </div>
                </div>

                <div className="form-row">
                    <div>
                        <label>Username</label>
                        <input type="text" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" placeholder="**********" />
                    </div>
                </div>

                <div className="form-row">
                    <div>
                        <label>Role</label>
                        <select required>
                            <option value="" disabled selected hidden>Select Role</option>
                            <option value="admin">Administrator</option>
                            <option value="cashier">Cashier</option>
                            <option value="waiter">Waiter</option>
                        </select>
                    </div>
                    <div>
                        <label>Branch</label>
                        <select required>
                            <option value="" disabled selected hidden>Select Branch</option>
                            <option value="sede96">96</option>
                        </select>
                    </div>
                </div>

                <div className="button-row">
                    <button type="submit" className="save-btn">Save User</button>
                    <button type="button" className="cancel-btn">Cancel</button>
                </div>
            </form>
        </section>
    )
}

export default AddUser