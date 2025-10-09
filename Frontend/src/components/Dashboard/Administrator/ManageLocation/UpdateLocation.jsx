function UpdateLocation() {
    return (
        <section className="section">
            <h2 className="title">Update Location</h2>
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
                        <label>Name</label>
                        <input type="text" />
                    </div>
                    <div>
                        <label>Address</label>
                        <input type="text" />
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

export default UpdateLocation