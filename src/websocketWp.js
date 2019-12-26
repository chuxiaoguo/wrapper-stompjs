/*
 * @Description: webbsoket封装
 * @Author: chuguo.zheng
 * @Date: 2019-07-29 14:22:25
 */
import SockJS from 'socket.io-client';
import Stomp from 'stompjs';

function isObject(value) {
    const type = typeof value
    return value != null && (type == 'object' || type == 'function')
}

export default class WebSocketFactory {

    /**
     * socket的唯一标识
     */
    socketId = '1231';

    /**
     * socketId的标识
     */
    socketTicket;

    /**
     * socket的订阅地址
     */
    socketUrl = '//113.88.13.224:9205/bas-ws-endpoint';

    /**
     * ws订阅地址
     */
    subscribeTag = "/user-ws/" + this.socketId + "/ws/noticeCenter";

    /**
     * ws消息推送地址
     */
    sendMsgTag = '/bas-ws-receive/ws/noticeCenterHeartBeat';

    /**
     * 心跳时间
     * 默认一分钟
     */
    heartBeatTime = 60000;

    /**
     * 时间轮询器
     */
    timer;

    /**
     * 处理服务端返回消息队列的回调函数
     */
    receiveMQCb;

    /**
     * ws连接成功的回调
     */
    connectSucCb;

    /**
     * ws连接失败的回调
     */
    connectErrCb;

    /**
     * stompjs（stompjs是websockets的消息协议的封装）实例
     */
    stompClient;

    /**
     * 订阅的目标，可以是个数组，因为可以建立多个订阅目标
     */
    subscription;

    debug = true;

    // 初始化属性
    constructor(webSocketObj) {
        // 初始化socketId
        if (webSocketObj && webSocketObj.socketId) {
            this._createdSocketId();
        }
        this._initWebSocketProp(webSocketObj);
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
    init() {
        const socket = new SockJS(this.socketUrl, undefined, {
            protocols_whitelist: ["websocket"]
        });
        this.stompClient = Stomp.over(socket);
        if (!this.debug) {
            this.stompClient.debug = null;
        }

        try {
            this.stompClient.connect({}, this._onConnect, this._onError);
        } catch (error) {}
    }

    /**
     * 停止websocket消息推送
     */
    stopConnect() {
        if (this.timer) {
            window.clearInterval(this.timer);
        }
        this.stompClient.disconnect(() => {
            // console.log("断开clientHeartBeat的webSocket连接");
        });
    }

    /**
     *  销毁ws实例
     */
    destroyed() {
        this.stopConnect();
        this.subscription.unsubscribe();
        this.stompClient.stopWsConnect();
        this.stompClient = null;
        this.receiveMQCb = null;
        this.connectSucCb = null;
        this.connectErrCb = null;
    }


    /**
     * 初始化配置项
     */
    _initWebSocketProp(webSocketObj) {
        if (!isObject(webSocketObj)) {
            return;
        }
        for (const propKey of Reflect.ownKeys(webSocketObj)) {
            if (Reflect.has(this, propKey)) {
                this[propKey] = webSocketObj[propKey];
            }
        }
    }

    /**
     * 初始化消息推送的websocket
     */
    _createdSocketId() {
        const phoneNum = localStorage.getItem('phoneNum');
        const email = localStorage.getItem('email');
        if (phoneNum && phoneNum != 'null' && phoneNum != 'undefined') {
            this.socketId = localStorage.getItem('phoneNum');
        } else if (email && email != 'null' && email != 'undefined') {
            this.socketId = localStorage.getItem('email');
        } else {
            this.socketId = Math.random().toString(36).substr(2)
        }
    }

    /**
     *  订阅消息 subscribe()
     *  目的地(destination) subscribeTag
     *  回调函数(callback) 处理后台推送的数据
     */
    _onConnect(frame) {
        this.subscription = this.stompClient.subscribe(this.subscribeTag, this.receiveMQCb);
        // 执行连接成功的回调
        this.connectSucCb && this.connectSucCb();
        // 发送心跳
        this._pollSendHeartBeat();
    }

    /**
     *  轮训发送心跳
     */
    _pollSendHeartBeat() {
        // 轮训发消息当作是心跳 -- 这里应该是设置heartBeat
        this.timer = setInterval(() => {
            // 连接的回调，同时也是心跳的发送方法
            this._sendMessage();
        }, this.heartBeatTime);
    }

    /**
     *  发送消息 send()
     */
    _sendMessage() {
        const timeStamp = new Date().getTime();
        const option = {
            ticket: this.socketTicket,
            message: 'HeartBeat',
            socketId: this.socketId,
            ts: timeStamp,
        };

        this.stompClient.send(this.sendMsgTag, {}, JSON.stringify(option));
    }

    /**
     * 推送异常
     */
    _onError(error) {
        // 执行连接失败的回调
        if (this.timer) {
            window.clearInterval(this.timer);
        }
        this.stompClient.stopWsConnect();
        this.connectErrCb && this.connectErrCb();
    }

}