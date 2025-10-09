function UpdateInventory() {
    return (
        <section className="section">
            <h2 className="title">Update Product</h2>
            <form className="form">
                <div className="form-row">
                    <div>
                        <label>Product Name</label>
                        <select required>
                            <option value="" disabled selected hidden>Select Product</option>
                            <option value="jack-daniels">Jack Daniel's Old No.7</option>
                            <option value="ron-zacapa-23">Ron Zacapa 23</option>
                            <option value="chivas-regal-12">Chivas Regal 12</option>
                            <option value="absolut-vodka">Absolut Vodka</option>
                            <option value="don-julio-blanco">Tequila Don Julio Blanco</option>
                            <option value="baileys-original">Baileys Original Irish Cream</option>
                            <option value="bombay-sapphire">Bombay Sapphire</option>
                            <option value="smirnoff-red">Smirnoff Vodka Red</option>
                            <option value="johnnie-walker-black">Johnnie Walker Black Label</option>
                            <option value="havana-club-7">Havana Club Añejo 7 Años</option>
                            <option value="patron-silver">Patrón Silver</option>
                            <option value="jagermeister">Jägermeister</option>
                            <option value="campari">Campari</option>
                            <option value="tanqueray-london-dry">Tanqueray London Dry Gin</option>
                            <option value="grey-goose">Grey Goose Vodka</option>
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

export default UpdateInventory