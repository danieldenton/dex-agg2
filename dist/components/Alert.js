"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_bootstrap_1 = require("react-bootstrap");
var Alert = function (_a) {
    var message = _a.message, transactionHash = _a.transactionHash, variant = _a.variant, setShowAlert = _a.setShowAlert;
    return (react_1.default.createElement(react_bootstrap_1.Alert, { variant: variant, onClose: function () { return setShowAlert(false); }, dismissible: true, className: "alert", style: { maxWidth: '270px', maxHeight: '150px' } },
        react_1.default.createElement(react_bootstrap_1.Alert.Heading, null, message),
        react_1.default.createElement("hr", null),
        transactionHash && (react_1.default.createElement("p", null, transactionHash.slice(0, 6) + "..." + transactionHash.slice(60, 66)))));
};
exports.default = Alert;
