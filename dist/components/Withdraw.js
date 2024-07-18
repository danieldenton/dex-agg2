"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var react_1 = __importStar(require("react"));
var react_redux_1 = require("react-redux");
var Card_1 = __importDefault(require("react-bootstrap/Card"));
var Form_1 = __importDefault(require("react-bootstrap/Form"));
var InputGroup_1 = __importDefault(require("react-bootstrap/InputGroup"));
var Dropdown_1 = __importDefault(require("react-bootstrap/Dropdown"));
var DropdownButton_1 = __importDefault(require("react-bootstrap/DropdownButton"));
var Button_1 = __importDefault(require("react-bootstrap/Button"));
var Row_1 = __importDefault(require("react-bootstrap/Row"));
var Spinner_1 = __importDefault(require("react-bootstrap/Spinner"));
var Alert_1 = __importDefault(require("./Alert"));
var interactions_1 = require("../store/interactions");
var Withdraw = function () {
    var _a = (0, react_1.useState)(""), token = _a[0], setToken = _a[1];
    var _b = (0, react_1.useState)(false), showAlert = _b[0], setShowAlert = _b[1];
    var dispatch = (0, react_redux_1.useDispatch)();
    var provider = (0, react_redux_1.useSelector)(function (state) { return state.provider.connection; });
    var tokens = (0, react_redux_1.useSelector)(function (state) { return state.tokens.contracts; });
    var symbols = (0, react_redux_1.useSelector)(function (state) { return state.tokens.symbols; });
    var balances = (0, react_redux_1.useSelector)(function (state) { return state.tokens.balances; });
    var dexAgg = (0, react_redux_1.useSelector)(function (state) { return state.dexAgg.contract; });
    var isWithdrawing = (0, react_redux_1.useSelector)(function (state) { return state.dexAgg.withdrawing.isWithdrawing; });
    var isSuccess = (0, react_redux_1.useSelector)(function (state) { return state.dexAgg.withdrawing.isSuccess; });
    var transactionHash = (0, react_redux_1.useSelector)(function (state) { return state.dexAgg.withdrawing.transactionHash; });
    (0, react_1.useEffect)(function () {
        (0, interactions_1.loadBalances)(tokens, dexAgg.address, dispatch);
    });
    var handleToken = function (e) {
        var target = e.target;
        setToken(target.innerHTML);
    };
    var handleWithdrawal = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!(token === symbols[0])) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, interactions_1.withdraw)(provider, dexAgg, tokens[0].address, dispatch)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, interactions_1.withdraw)(provider, dexAgg, tokens[1].address, dispatch)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(Card_1.default, { style: {
                maxWidth: "550px",
                height: "392px",
                borderRadius: "5%",
                border: "solid 4px #7D3CB5",
            }, className: "mx-auto  bg-dark" },
            react_1.default.createElement(Form_1.default, { onSubmit: handleWithdrawal, style: { maxWidth: "450px", margin: "50px auto" } },
                react_1.default.createElement(Row_1.default, { className: "my-4" },
                    react_1.default.createElement("div", { className: "d-flex justify-content-between" },
                        react_1.default.createElement(Form_1.default.Label, { className: "text-light" },
                            react_1.default.createElement("strong", null, "Amount to Withdraw:"))),
                    react_1.default.createElement(InputGroup_1.default, null,
                        react_1.default.createElement(Form_1.default.Control, { type: "number", placeholder: "0.0", value: token
                                ? token === symbols[0]
                                    ? balances[0]
                                    : balances[1]
                                : "", disabled: true, className: "bg-light border-light" }),
                        react_1.default.createElement(DropdownButton_1.default, { variant: "outline-light text-light bg-dark", title: token ? token : "Select Token" },
                            react_1.default.createElement(Dropdown_1.default.Item, { onClick: function (e) { return handleToken(e); } }, "RUMP"),
                            react_1.default.createElement(Dropdown_1.default.Item, { onClick: function (e) { return handleToken(e); } }, "USD")))),
                react_1.default.createElement(Row_1.default, null, isWithdrawing ? (react_1.default.createElement(Spinner_1.default, { animation: "border", style: { display: "block", margin: "0 auto", color: "#CCFF00" } })) : (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(Button_1.default, { type: "submit", style: {
                            height: "45px",
                            border: "none",
                            backgroundColor: "#7d3cb5",
                            marginTop: '34px'
                        } }, "Withdraw")))))),
        isWithdrawing ? (react_1.default.createElement(Alert_1.default, { message: "Withdraw Pending...", transactionHash: null, variant: "info", setShowAlert: setShowAlert })) : isSuccess && showAlert ? (react_1.default.createElement(Alert_1.default, { message: "Swap Successful", transactionHash: transactionHash, variant: "success", setShowAlert: setShowAlert })) : !isSuccess && showAlert ? (react_1.default.createElement(Alert_1.default, { message: "Swap Failed", transactionHash: null, variant: "light", setShowAlert: setShowAlert })) : (react_1.default.createElement(react_1.default.Fragment, null))));
};
exports.default = Withdraw;
