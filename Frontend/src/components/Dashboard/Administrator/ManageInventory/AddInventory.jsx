function AddInventory() {
    return (
        <section className="section">
            <h2 className="title">Add Product</h2>
            <form className="form">
                <div className="form-row">
                    <div>
                        <label>Product Name</label>
                        <input type="text" />
                    </div>
                    <div>
                        <label>Category</label>
                        <input type="text" />
                    </div>
                </div>
                <div className="form-row">
                    <div>
                        <label>Cost</label>
                        <input type="text" />
                    </div>
                    <div>
                        <label>Sale Price</label>
                        <input type="text"/>
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

export default AddInventory