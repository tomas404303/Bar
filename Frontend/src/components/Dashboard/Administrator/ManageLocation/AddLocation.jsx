function AddLocation() {
    return (
        <section className="section">
            <h2 className="title">Add Location</h2>
            <form className="form">
                <div className="form-row">
                    <div>
                        <label>Name</label>
                        <input type="text" />
                    </div>
                </div>
                <div className="form-row">
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

export default AddLocation