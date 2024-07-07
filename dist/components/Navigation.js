"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var Navbar_1 = __importDefault(require("react-bootstrap/Navbar"));
var Form_1 = __importDefault(require("react-bootstrap/Form"));
var react_blockies_1 = __importDefault(require("react-blockies"));
var config_json_1 = __importDefault(require("../config.json"));
var Navigation = function () {
    var chainId = (0, react_redux_1.useSelector)(function (state) { return state.provider.chainId; });
    var account = (0, react_redux_1.useSelector)(function (state) { return state.provider.account; });
    var config = config_json_1.default;
    var handleNetwork = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.ethereum) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log(e.target.value, chainId);
                    return [4 /*yield*/, window.ethereum.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: e.target.value }],
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    console.error("MetaMask is not installed");
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (react_1.default.createElement(Navbar_1.default, { className: "my-3 bg-dark", expand: "lg", style: { minHeight: "80px" } },
        react_1.default.createElement(Navbar_1.default.Brand, { className: "fw-bold", style: { color: "#CCFF00" } }, "Dex Aggregator"),
        react_1.default.createElement(Navbar_1.default.Toggle, { "aria-controls": "nav" }),
        react_1.default.createElement(Navbar_1.default.Collapse, { id: "nav", className: "justify-content-end" },
            react_1.default.createElement("div", { className: "d-flex justify-content-end mt-3 bg-dark border-light" },
                account ? (react_1.default.createElement(Navbar_1.default.Text, { style: { marginRight: "20px" }, className: "d-flex align-items-center text-light" },
                    account.slice(0, 5) + "..." + account.slice(38, 42),
                    react_1.default.createElement(react_blockies_1.default, { seed: account, size: 10, scale: 3, color: "#7D3CB5", bgColor: "rgb(13 110 253)", spotColor: "white", className: "identicon mx-2" }))) : (react_1.default.createElement(react_1.default.Fragment, null)),
                react_1.default.createElement(Form_1.default.Select, { className: "bg-light border-light text-dark", "aria-label": "Network Selector", value: config[chainId] ? "0x".concat(chainId.toString(16)) : "0", onChange: handleNetwork, style: { maxWidth: "200px", marginRight: "20px" } },
                    react_1.default.createElement("option", { value: "0", disabled: true }, "Select Network"),
                    react_1.default.createElement("option", { value: "0x7A69" }, "Localhost"),
                    react_1.default.createElement("option", { value: "0xaa36a7" }, "Sepolia"))))));
};
exports.default = Navigation;
