module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ sistema: "Luna System 2018", status: "Online" });
};
