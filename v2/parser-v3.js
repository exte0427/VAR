var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Var;
(function (Var) {
    Var.make = function (tagName, states) {
        var childNodes = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            childNodes[_i - 2] = arguments[_i];
        }
        return new VarInternal.parser.virtualDom(tagName, states, childNodes.flat(), "", new VarInternal.key.keyForm(-1, -1));
    };
    Var.text = function (value) {
        return new VarInternal.parser.virtualDom("text", [], [], value, new VarInternal.key.keyForm(-1, -1));
    };
    Var.state = function (stateName, stateVal) {
        return new VarInternal.parser.virtualState(stateName, stateVal);
    };
    var varForm = /** @class */ (function () {
        function varForm(name_, start_, update_, render_, variable_, state_) {
            if (name_ === void 0) { name_ = ""; }
            if (start_ === void 0) { start_ = null; }
            if (update_ === void 0) { update_ = null; }
            if (render_ === void 0) { render_ = null; }
            if (variable_ === void 0) { variable_ = {}; }
            if (state_ === void 0) { state_ = {}; }
            this.name = name_;
            this.state = state_;
            this.start = start_;
            this.update = update_;
            this.render = render_;
            this.variable = variable_;
        }
        varForm.prototype.getStart = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var returnData;
            if (this.start instanceof Function)
                returnData = this.start.apply(this, args);
            else
                returnData = this.start;
            return returnData;
        };
        varForm.prototype.getUpdate = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var returnData;
            if (this.update instanceof Function)
                returnData = this.update.apply(this, args);
            else
                returnData = this.update;
            return returnData;
        };
        return varForm;
    }());
    Var.varForm = varForm;
})(Var || (Var = {}));
var VarInternal;
(function (VarInternal) {
    var data;
    (function (data) {
        data.varList = [];
    })(data = VarInternal.data || (VarInternal.data = {}));
    var parser;
    (function (parser) {
        var virtualState = /** @class */ (function () {
            function virtualState(attributeName_, value_) {
                this.attributeName = attributeName_;
                this.value = value_;
            }
            return virtualState;
        }());
        parser.virtualState = virtualState;
        var virtualDom = /** @class */ (function () {
            function virtualDom(tagName_, attributesList_, childList_, value_, key_, var_) {
                if (var_ === void 0) { var_ = new Var.varForm(); }
                this.tagName = tagName_;
                this.attributesList = attributesList_;
                this.childList = childList_;
                this.value = value_;
                this.key = key_;
                this["var"] = var_;
            }
            return virtualDom;
        }());
        parser.virtualDom = virtualDom;
        parser.getHtml = function () {
            return document.querySelector("html");
        };
        parser.parseText = function (text) {
            var startNum = -1;
            var endNum = -1;
            for (var i = 0; i < text.length; i++) {
                var nowChar = text[i];
                if (nowChar !== "\n" && nowChar !== " ") {
                    startNum = i;
                    break;
                }
            }
            for (var i = text.length - 1; i >= 0; i--) {
                var nowChar = text[i];
                if (nowChar !== "\n" && nowChar !== " ") {
                    endNum = i;
                    break;
                }
            }
            if (startNum === -1 || endNum == -1)
                return "";
            return text.slice(startNum, endNum + 1);
        };
        parser.texToDom = function (text) {
            return new virtualDom("text", [], [], text, new VarInternal.key.keyForm(-1, -1));
        };
        parser.parseAttributes = function (attributes) {
            var returningStates = [];
            for (var i = 0; i < attributes.length; i++) {
                var nowAttribute = attributes[i];
                returningStates.push(new virtualState(nowAttribute.name, nowAttribute.value));
            }
            return returningStates;
        };
        parser.parse = function (element, key) {
            var children = [];
            var tagName = "";
            var attributes = [];
            var text = "";
            if (element instanceof HTMLElement || element instanceof Element) {
                tagName = element.tagName.toLowerCase();
                attributes = parser.parseAttributes(element.attributes);
                text = element.innerHTML;
                var nowChild = html.getChild(element);
                for (var i = 0; i < nowChild.length; i++) {
                    children.push(parser.parse(nowChild[i], i));
                }
            }
            else if (element != undefined) {
                tagName = "text";
                text = parser.parseText(element.nodeValue);
            }
            return new virtualDom(tagName, attributes, children, text, new VarInternal.key.keyForm(key, children.length));
        };
    })(parser = VarInternal.parser || (VarInternal.parser = {}));
    var key;
    (function (key_1) {
        var keyForm = /** @class */ (function () {
            function keyForm(myKey_, lastKey_) {
                this.myKey = myKey_;
                this.lastKey = lastKey_;
            }
            return keyForm;
        }());
        key_1.keyForm = keyForm;
        key_1.getElement = function (virtualList, key) {
            var returnData = virtualList.find(function (element) { return element.key.myKey === key; });
            if (returnData instanceof parser.virtualDom)
                return returnData;
            else {
                console.error("".concat(key, " is not found"));
                return new parser.virtualDom("", [], [], "", new VarInternal.key.keyForm(-1, -1));
            }
        };
    })(key = VarInternal.key || (VarInternal.key = {}));
    var html;
    (function (html) {
        html.getChild = function (parent) {
            var childList = [];
            for (var i = 0; i < parent.childNodes.length; i++) {
                var child = parent.childNodes[i];
                if (child.nodeValue === null || parser.parseText(child.nodeValue) !== "")
                    childList.push(child);
            }
            return childList;
        };
    })(html = VarInternal.html || (VarInternal.html = {}));
    var main;
    (function (main) {
        main.firstData = undefined;
        main.lastData = undefined;
        main.nowData = undefined;
        main.delList = [];
        main.init = function () {
            //start
            console.log("Var.js");
            main.firstData = parser.parse(parser.getHtml(), 0);
            main.lastData = main.firstData;
            main.nowData = main.firstData;
        };
        main.detectStart = function (time) {
            setInterval(function () {
                //set now data
                main.nowData = detecter.subVar(__assign({}, main.firstData));
                detecter.detect(document, main.lastData, main.nowData, 1);
                main.delList.map(function (element) { return changer.del(element); });
                main.delList = [];
                //set last data
                main.lastData = main.nowData;
            }, time);
        };
    })(main = VarInternal.main || (VarInternal.main = {}));
    var changer;
    (function (changer) {
        changer.make = function (data) {
            if (data.tagName == "text")
                return document.createTextNode(data.value);
            else {
                var myDom_1 = document.createElement(data.tagName);
                data.attributesList.map(function (element) {
                    myDom_1.setAttribute(element.attributeName, element.value);
                });
                data.childList.map(function (element) {
                    myDom_1.append(changer.make(element));
                });
                return myDom_1;
            }
        };
        changer.add = function (parent, data) {
            parent.appendChild(changer.make(data));
        };
        changer.del = function (data) {
            data.remove();
        };
        changer.change = function (parent, target, newData) {
            parent.replaceChild(changer.make(newData), target);
        };
        changer.attrChange = function (target, lastAttr, nowAttr) {
            nowAttr.map(function (element) {
                var _a;
                if (lastAttr.find(function (e) { return e.attributeName === element.attributeName; }) == undefined)
                    target.setAttribute(element.attributeName, element.value);
                if (element.value !== ((_a = lastAttr.find(function (e) { return e.attributeName === element.attributeName; })) === null || _a === void 0 ? void 0 : _a.value))
                    target.setAttribute(element.attributeName, element.value);
            });
            //del
            lastAttr.map(function (element) {
                if (nowAttr.find(function (e) { return e.attributeName === element.attributeName; }) == undefined)
                    target.removeAttribute(element.attributeName);
            });
        };
    })(changer = VarInternal.changer || (VarInternal.changer = {}));
    var detecter;
    (function (detecter) {
        detecter.excute = function (target) {
            var myVar = target["var"];
            var _loop_1 = function (element) {
                var myValue = target.attributesList.find(function (e) { return e.attributeName === element; });
                if (myValue === undefined)
                    myVar.state[element] = undefined;
                else
                    myVar.state[element] = myValue.value;
            };
            for (var _i = 0, _a = Object.keys(target["var"].state); _i < _a.length; _i++) {
                var element = _a[_i];
                _loop_1(element);
            }
            if (myVar.update !== null)
                myVar.variable = myVar.update(myVar.variable, myVar.state);
            var childList = myVar.render(myVar.variable, myVar.state).childList;
            childList = childList.map(function (element) { return detecter.subVar(element); });
            return new parser.virtualDom(target.tagName, target.attributesList, childList, target.value, target.key, myVar);
        };
        detecter.subVar = function (target) {
            if (target["var"].name === "") {
                var myTemplate = templates.find(function (element) { return element.name === target.tagName; });
                if (myTemplate === undefined) {
                    return new parser.virtualDom(target.tagName, target.attributesList, target.childList.map(function (element) { return detecter.subVar(element); }), target.value, target.key, target["var"]);
                }
                else {
                    var myVar = new Var.varForm();
                    myVar.name = myTemplate.name;
                    myVar.state = JSON.parse("{".concat(myTemplate.state.map(function (element) { return ("\"".concat(element, "\":\"\"")); }).join(","), "}"));
                    myVar.variable = JSON.parse("{".concat(myTemplate.variables.map(function (element) { return ("\"".concat(element, "\":\"\"")); }).join(","), "}"));
                    myVar.start = myTemplate.firFunc;
                    myVar.update = myTemplate.upFunc;
                    myVar.render = myTemplate.render;
                    if (myVar.start !== null)
                        myVar.variable = myVar.start();
                    return detecter.excute(new parser.virtualDom(target.tagName, target.attributesList, target.childList, target.value, target.key, myVar));
                }
            }
            else {
                return detecter.excute(target);
            }
        };
        detecter.detect = function (parent, lastData, nowData, index) {
            if (parent instanceof HTMLElement) {
                var target = (html.getChild(parent)[index]);
                if (!lastData && !nowData)
                    console.error("unexpected error");
                else if (!lastData && nowData) {
                    changer.add(parent, nowData);
                    return;
                }
                else if (lastData && !nowData) {
                    main.delList.push(target);
                    return;
                }
                else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) !== (nowData === null || nowData === void 0 ? void 0 : nowData.tagName)) {
                    changer.change(parent, target, nowData);
                    return;
                }
                else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) === "text" && (nowData === null || nowData === void 0 ? void 0 : nowData.tagName) === "text" && lastData.value != nowData.value) {
                    changer.change(parent, target, nowData);
                    return;
                }
                else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) === (nowData === null || nowData === void 0 ? void 0 : nowData.tagName) && (lastData === null || lastData === void 0 ? void 0 : lastData.tagName) != "text")
                    changer.attrChange(target, lastData === null || lastData === void 0 ? void 0 : lastData.attributesList, nowData === null || nowData === void 0 ? void 0 : nowData.attributesList);
            }
            var maxData = (lastData === null || lastData === void 0 ? void 0 : lastData.childList.length) > (nowData === null || nowData === void 0 ? void 0 : nowData.childList.length) ? lastData === null || lastData === void 0 ? void 0 : lastData.childList : nowData === null || nowData === void 0 ? void 0 : nowData.childList;
            if (maxData !== undefined) {
                for (var i = 0; i < maxData.length; i++) {
                    var nowElement = html.getChild(parent)[index];
                    detecter.detect((nowElement), lastData === null || lastData === void 0 ? void 0 : lastData.childList[i], nowData === null || nowData === void 0 ? void 0 : nowData.childList[i], i);
                }
            }
        };
    })(detecter = VarInternal.detecter || (VarInternal.detecter = {}));
})(VarInternal || (VarInternal = {}));
VarInternal.main.init();
VarInternal.main.detectStart(100);
