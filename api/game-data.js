module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
        temporada_alvo: "2018",
        status_servidor: "Operacional",
        bypasses: ["SkinInject", "NameColor", "RetroLobby"]
    });
};

