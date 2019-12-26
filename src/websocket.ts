/*
 * @Description: webbsoket封装
 * @Author: chuguo.zheng
 * @Date: 2019-07-29 14:22:25
 */
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

function isObject(value) {
    const type = typeof value
    return value != null && (type === 'object' || type === 'function')
}

declare type CbType = (message?: any) => void;
export interface WebSocketParams {
    socketId?: string,
    socketUrl?: string,
    socketTicket?: string,
    subscribeTag?: string,
    sendMsgTag?: string,
    heartBeatTime?: number,
    debug?: boolean;
}
export class WebSocketFactory {
    
    /**
     * socket的唯一标识
     */
    private socketId: string | number = '1231';

    /**
     * socket的订阅地址
     */
    private socketUrl: string = '//113.88.13.224:9205/bas-ws-endpoint';

    /**
     * socketId的标识
     */
    private socketTicket: string | number;
    
    /**
     * ws订阅地址
     */
    private subscribeTag: string = "/user-ws/" + this.socketId + "/ws/noticeCenter";

    /**
     * ws消息推送地址
     */
    private sendMsgTag: string = '/bas-ws-receive/ws/noticeCenterHeartBeat';

    /**
     * 心跳时间
     * 默认一分钟
     */
    private heartBeatTime: number = 60000;

    /**
     * 时间轮询器
     */
    private timer: any;

    /**
     * 处理服务端返回消息队列的回调函数
     */
    private receiveMQCb: CbType;

    /**
     * ws连接成功的回调
     */
    private connectSucCb: CbType;

    /**
     * ws连接失败的回调
     */
    private connectErrCb: CbType;

    /**
     * stompjs（stompjs是websockets的消息协议的封装）实例
     */
    private stompClient: any;

    /**
     * 订阅的目标，可以是个数组，因为可以建立多个订阅目标
     */
    private subscription: any;

    private debug: boolean = true;

    // 初始化属性
    constructor(webSocketObj?: WebSocketParams, MQCb?: CbType, sucCb?: CbType, errCb?: CbType) {
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
    public init(): void {
        const socket = new SockJS(this.socketUrl, undefined, {
            protocols_whitelist: ["websocket"]
        });
        this.stompClient = Stomp.over(socket);
        if (!this.debug) {
            this.stompClient.debug = null;
        }
        
        try {
            this.stompClient.connect({}, this.onConnect.apply(this), this.onError.apply(this));
        } catch (error) {
            this.onError.apply(this, [error])
        }
    }


    /**
     * 停止websocket消息推送
     */
    public stopConnect() {
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
    public destroyed(): void {
        this.stopConnect();
        this.subscription.unsubscribe();
        this.stompClient.stopWsConnect();
        this.stompClient = null;
        this.receiveMQCb = null;
        this.connectSucCb = null;
        this.connectErrCb = null;
    }
    
    /**
     *  订阅消息 subscribe()
     *  目的地(destination) subscribeTag
     *  回调函数(callback) 处理后台推送的数据
     */
    private onConnect(frame) {
        this.subscription = this.stompClient.subscribe(this.subscribeTag, this.receiveMQCb);
        // 执行连接成功的回调
        this.connectSucCb && this.connectSucCb();
        // 发送心跳
        this.pollSendHeartBeat();
    }

    /**
     *  轮训发送心跳
     */
    private pollSendHeartBeat(): void {
        // 轮训发消息当作是心跳 -- 这里应该是设置heartBeat
        this.timer = setInterval(() => {
            // 连接的回调，同时也是心跳的发送方法
            this.sendMessage();
        }, this.heartBeatTime);
    }

    /**
     *  发送消息 send()
     */
    private sendMessage() {
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
    private onError(error: any) {
        // 执行连接失败的回调
        if (this.timer) {
            window.clearInterval(this.timer);
        }
        if (this.stompClient) {
            this.stompClient.stopWsConnect && this.stompClient.stopWsConnect();
        }
        this.connectErrCb && this.connectErrCb(error);
    }

    /**
     * 初始化配置项
     */
    private initWebSocketProp(webSocketObj): void {
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
    private created(): void {
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
}