function UpdateUser() {
    return (
        <div>
            <section className="section" >
                <h2 className="title">Update User</h2>
                <form className="form">
                    <div className="form-row">
                        <div>
                            <label>ID Number</label>
                            <input type="text" />
                        </div>
                        <div>
                            <label>Status</label>
                            <select required>
                                <option value="" disabled selected hidden>Select Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
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
                    <div className="form-row">
                        <div>
                            <label>New Password</label>
                            <input type="password" placeholder="**********" />
                        </div>
                        <div>
                            <label>Confirm New Password</label>
                            <input type="password" placeholder="**********" />
                        </div>
                    </div>
                    <div className="button-row">
                        <button type="submit" className="save-btn">Save Changes</button>
                        <button type="button" className="cancel-btn">Cancel</button>
                    </div>
                </form>
            </section>
        </div>
    )
}

export default UpdateUser