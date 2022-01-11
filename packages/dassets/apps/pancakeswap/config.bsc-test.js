"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var swaps = {
    name: "Pancakeswap",
    MasterChef: "0xbCC50b0B0AFD19Ee83a6E79e6c01D51b16090A0B",
    Router: "0x367633909278A3C91f4cB130D8e56382F00D1071",
    Factory: "0xda8EE87e2172d997a7fe05a83FC5c472B40FacCE",
    LpTokens: [
        {
            pid: 16,
            name: "BETH-ETH LP",
            address: "0x8F98153c0F907617d86FA3e93d9766826B126a5A",
        },
        {
            pid: 21,
            name: "CAKE-WBNB LP",
            address: "0x9cC2bed47Aa2346f7d01F53d888724c87c810EC2"
        },
        {
            pid: 22,
            name: "BTCB-WBNB LP",
            address: "0xdF85a773771875F96493FDdB341A197d860Bc90d"
        },
        {
            pid: 23,
            name: "ETH-WBNB LP",
            address: "0xC4aaAac2C7b0e76dc53eaaD0495df30030A0A1c4"
        },
        {
            pid: 24,
            name: "USDT-BUSD LP",
            address: "0x7bd6AB478b47fd096E37CCA290eB4409544a50F2"
        },
        {
            pid: 25,
            name: "DOT-WBNB LP",
            address: "0xCB217DC5fAd9eA8f71c0c1E60c0Be97AE65e3654"
        },
        {
            pid: 26,
            name: "UNI-WBNB LP",
            address: "0x652F66573Fed901a459363046dC6aC6474E71305"
        },
        {
            pid: 27,
            name: "LINK-WBNB LP",
            address: "0xE8761502Ace4a88e34b04eD26229cd01159a4e7B"
        },
        {
            pid: 28,
            name: "XVS-WBNB LP",
            address: "0x3fad087a019634b7d21f7E49668a5EA155FF20e4"
        },
        {
            pid: 29,
            name: "YFI-WBNB LP",
            address: "0x7Dec2528edCd14f8577D69a6badc10646130bE4C"
        },
        {
            pid: 30,
            name: "VAI-BUSD LP",
            address: "0x1109e443Bf37194f6B31B9A8E2ec52A88169606a"
        },
        {
            pid: 31,
            name: "USDC-BUSD LP",
            address: "0x142cc7fe062ff0e1cF40a73b5E7CB583817278Cb"
        },
        {
            pid: 32,
            name: "DAI-BUSD LP",
            address: "0x0B77762F65016BDFaEa82BcABa00Dce320B8697C"
        },
        {
            pid: 33,
            name: "UST-BUSD LP",
            address: "0x55A1425980bf718380B902fE293705e82594E4EF"
        },
        {
            pid: 35,
            name: "COMP-ETH LP",
            address: "0x185F20C5AF3dA949e41D287984c1A4f5652A48b1"
        },
        {
            pid: 36,
            name: "SUSHI-ETH LP",
            address: "0x7245467FC12d9a6904966aaf2c2ffC8f57b97667"
        },
        {
            pid: 37,
            name: "ITAM-WBNB LP",
            address: "0x2E02F4512599C9a6a1a5A1602e3c8DbDA129cCfD"
        },
        {
            pid: 38,
            name: "WBNB-BUSD LP",
            address: "0x8918A1B7d90B2d33eA89784a8405896430Dd0Ba9"
        },
        {
            pid: 39,
            name: "ALPACA-BUSD LP",
            address: "0xF76cD665848A21C4C634B6956719813c617646C9"
        },
        {
            pid: 40,
            name: "BTCB-BUSD LP",
            address: "0x958BD4cF570D4de0E59db9926Ce138f6FE96464D"
        },
        {
            pid: 41,
            name: "bMXX-WBNB LP",
            address: "0xc4A3DE5e10AE6E7312C9A4646F23B4B07E1c09b8"
        },
        {
            pid: 42,
            name: "BELT-WBNB LP",
            address: "0xA22A71d3993D3DC1Be74554046610bb3EA4B9E87"
        },
        {
            pid: 43,
            name: "BOR-WBNB LP",
            address: "0x376B2a364298d116384903B544C2515729661011"
        },
        {
            pid: 44,
            name: "BRY-WBNB LP",
            address: "0x89edDA1208ab8368C1d6Be6B5956e6EB2ABe5ebB"
        },
        {
            pid: 45,
            name: "pCWS-WBNB LP",
            address: "0x4EBF2181d75c7246712274eF674fA219D458a42C"
        },
        {
            pid: 46,
            name: "SWINGBY-WBNB LP",
            address: "0x8760aFEeF41C544324261bd974b113512f5E5243"
        },
        {
            pid: 47,
            name: "DODO-WBNB LP",
            address: "0x92D7AB192c9EddD6aeD9B95F39F4f1b7D1cfb044"
        },
        {
            pid: 48,
            name: "USDT-WBNB LP",
            address: "0xe220CD41e219e0e350C40cCb231af8F5C3E109fd"
        },
        {
            pid: 49,
            name: "CAKE-BUSD LP",
            address: "0xf77bE38a641dE1a70b3ECC51655c8e4776fE3F6a"
        },
        {
            pid: 0,
            name: "CAKE",
            address: "0x7aBcA3B5f0Ca1da0eC05631d5788907D030D0a22"
        },
        {
            pid: 50,
            name: "BORING-WBNB LP",
            address: "0x98135F51bd36Db97222024F26B588728Ad96BEa3"
        },
        {
            pid: 51,
            name: "ODDZ-WBNB LP",
            address: "0x4B2EB15AE0d772C1846249db78c3Cbe9FbB1F4fB"
        },
        {
            pid: 52,
            name: "TUSD-BUSD LP",
            address: "0x557f6a13D6C09bA8918f63C51Dd90eD0Ae5685A7"
        },
        {
            pid: 54,
            name: "ADA-WBNB LP",
            address: "0xc6Ddd130C132458a2d71098eE619fdc5d78E2371"
        },
        {
            pid: 56,
            name: "FORM-BUSD LP",
            address: "0xBf4301EF97585016ecB2D955b5190510654E9e96"
        },
        {
            pid: 57,
            name: "CAKE-USDT LP",
            address: "0x68213338E9A2c1010AaB78E79a78f5c27659397F"
        },
        {
            pid: 58,
            name: "USDC-USDT LP",
            address: "0x8E2fFdBf7713b7c68418CFA7ee65430C544C44d7"
        },
        {
            pid: 59,
            name: "TRX-WBNB LP",
            address: "0xd913790f6D4a670A204AD538BaB95611f7387e58"
        },
        {
            pid: 60,
            name: "BTT-WBNB LP",
            address: "0x2D7B149Ee7659254fd39d6F33e7b713544403257"
        },
        {
            pid: 61,
            name: "ORBS-BUSD LP",
            address: "0x367D7858baC57B32DeEC5B0C9C81bB2794DE1dB8"
        },
        {
            pid: 62,
            name: "AXS-WBNB LP",
            address: "0xa51969919bccF97EE5d98563091Ad94E365489Cf"
        },
        {
            pid: 63,
            name: "TRX-BUSD LP",
            address: "0x8Eaa1Ab40fF74A93976e4B86Fa9602fE37532b19"
        },
        {
            pid: 64,
            name: "BTT-BUSD LP",
            address: "0x9984332666105b8a9578C4Fb8C22944CC3280cE7"
        },
        {
            pid: 65,
            name: "PMON-BUSD LP",
            address: "0xECdD9c374D037418cC6840ffC8C2DB25D6b8Cf62"
        },
        {
            pid: 66,
            name: "PHA-BUSD LP",
            address: "0x36Ea0dbDF7bc4Ced9813700D3d0c280e0c3f1e79"
        },
        {
            pid: 67,
            name: "NAOS-WBNB LP",
            address: "0xd3832c85c56087039bAB487adD6ab35930eE138d"
        },
        {
            pid: 68,
            name: "MBOX-WBNB LP",
            address: "0x8BE59f83977879A611cA77F957edAC902E3d91a5"
        },
        {
            pid: 69,
            name: "DVI-WBNB LP",
            address: "0x7B443b2Ca4F2b997D1A4A556A575562e7EE96d8c"
        },
        {
            pid: 70,
            name: "QBT-WBNB LP",
            address: "0xEB43Fbf74cCA64a6aD385F31637fE41A93586707"
        },
        {
            pid: 71,
            name: "POTS-BUSD LP",
            address: "0x66CC2C656a8e8744a88eEF641415E1059F8632c2"
        },
        {
            pid: 72,
            name: "BMON-BUSD LP",
            address: "0x8DeBeEcc8d37BED5631341D5003f148717ebF721"
        },
        {
            pid: 73,
            name: "BMON-WBNB LP",
            address: "0x5bB0ac2B9B2944F76FC098De40BC224E03b43fec"
        }
    ]
};
exports.default = swaps;
