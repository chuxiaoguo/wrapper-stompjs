(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('sockjs-client'), require('stompjs')) :
    typeof define === 'function' && define.amd ? define(['exports', 'sockjs-client', 'stompjs'], factory) :
    (global = global || self, factory(global.wrapperWebSocket = {}, global.sockjsClient, global.stompjs));
}(this, (function (exports, SockJS, Stomp) { 'use strict';

    SockJS = SockJS && SockJS.hasOwnProperty('default') ? SockJS['default'] : SockJS;
    Stomp = Stomp && Stomp.hasOwnProperty('default') ? Stomp['default'] : Stomp;

    /*
     * @Description: webbsoket封装
     * @Author: chuguo.zheng
     * @Date: 2019-07-29 14:22:25
     */
    function isObject(value) {
        var type = typeof value;
        return value != null && (type === 'object' || type === 'function');
    }
    var WebSocketFactory = /** @class */ (function () {
        // 初始化属性
        function WebSocketFactory(webSocketObj, MQCb, sucCb, errCb) {
            /**
             * socket的唯一标识
             */
            this.socketId = '1231';
            /**
             * socket的订阅地址
             */
            this.socketUrl = '//113.88.13.224:9205/bas-ws-endpoint';
            /**
             * ws订阅地址
             */
            this.subscribeTag = "/user-ws/" + this.socketId + "/ws/noticeCenter";
            /**
             * ws消息推送地址
             */
            this.sendMsgTag = '/bas-ws-receive/ws/noticeCenterHeartBeat';
            /**
             * 心跳时间
             * 默认一分钟
             */
            this.heartBeatTime = 60000;
            this.debug = true;
            // 初始化socketId
            if (webSocketObj && webSocketObj.socketId) {
                this.created();
            }
            this.initWebSocketProp(webSocketObj);
            if (!this.receiveMQCb) {
                this.receiveMQCb = MQCb;
            }
            if (!this.connectSucCb) {
                this.connectSucCb = sucCb;
            }
            if (!this.connectErrCb) {
                this.connectErrCb = errCb;
            }
        }
        /**
         * 心跳发送
         */
        WebSocketFactory.prototype.init = function () {
            var socket = new SockJS(this.socketUrl, undefined, {
                protocols_whitelist: ["websocket"]
            });
            this.stompClient = Stomp.over(socket);
            if (!this.debug) {
                this.stompClient.debug = null;
            }
            try {
                this.stompClient.connect({}, this.onConnect.apply(this), this.onError.apply(this));
            }
            catch (error) {
                this.onError.apply(this, [error]);
            }
        };
        /**
         * 停止websocket消息推送
         */
        WebSocketFactory.prototype.stopConnect = function () {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.stompClient.disconnect(function () {
                // console.log("断开clientHeartBeat的webSocket连接");
            });
        };
        /**
         *  销毁ws实例
         */
        WebSocketFactory.prototype.destroyed = function () {
            this.stopConnect();
            this.subscription.unsubscribe();
            this.stompClient.stopWsConnect();
            this.stompClient = null;
            this.receiveMQCb = null;
            this.connectSucCb = null;
            this.connectErrCb = null;
        };
        /**
         *  订阅消息 subscribe()
         *  目的地(destination) subscribeTag
         *  回调函数(callback) 处理后台推送的数据
         */
        WebSocketFactory.prototype.onConnect = function (frame) {
            this.subscription = this.stompClient.subscribe(this.subscribeTag, this.receiveMQCb);
            // 执行连接成功的回调
            this.connectSucCb && this.connectSucCb();
            // 发送心跳
            this.pollSendHeartBeat();
        };
        /**
         *  轮训发送心跳
         */
        WebSocketFactory.prototype.pollSendHeartBeat = function () {
            var _this = this;
            // 轮训发消息当作是心跳 -- 这里应该是设置heartBeat
            this.timer = setInterval(function () {
                // 连接的回调，同时也是心跳的发送方法
                _this.sendMessage();
            }, this.heartBeatTime);
        };
        /**
         *  发送消息 send()
         */
        WebSocketFactory.prototype.sendMessage = function () {
            var timeStamp = new Date().getTime();
            var option = {
                ticket: this.socketTicket,
                message: 'HeartBeat',
                socketId: this.socketId,
                ts: timeStamp,
            };
            this.stompClient.send(this.sendMsgTag, {}, JSON.stringify(option));
        };
        /**
         * 推送异常
         */
        WebSocketFactory.prototype.onError = function (error) {
            // 执行连接失败的回调
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            if (this.stompClient) {
                this.stompClient.stopWsConnect && this.stompClient.stopWsConnect();
            }
            this.connectErrCb && this.connectErrCb(error);
        };
        /**
         * 初始化配置项
         */
        WebSocketFactory.prototype.initWebSocketProp = function (webSocketObj) {
            if (!isObject(webSocketObj)) {
                return;
            }
            for (var _i = 0, _a = Reflect.ownKeys(webSocketObj); _i < _a.length; _i++) {
                var propKey = _a[_i];
                if (Reflect.has(this, propKey)) {
                    this[propKey] = webSocketObj[propKey];
                }
            }
        };
        /**
         * 初始化消息推送的websocket
         */
        WebSocketFactory.prototype.created = function () {
            var phoneNum = localStorage.getItem('phoneNum');
            var email = localStorage.getItem('email');
            if (phoneNum && phoneNum != 'null' && phoneNum != 'undefined') {
                this.socketId = localStorage.getItem('phoneNum');
            }
            else if (email && email != 'null' && email != 'undefined') {
                this.socketId = localStorage.getItem('email');
            }
            else {
                this.socketId = Math.random().toString(36).substr(2);
            }
        };
        return WebSocketFactory;
    }());

    exports.WebSocketFactory = WebSocketFactory;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=wrapper-stompjs.umd.js.map
