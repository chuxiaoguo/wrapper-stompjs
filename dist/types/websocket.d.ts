declare type CbType = (message?: any) => void;
export interface WebSocketParams {
    socketId?: string;
    socketUrl?: string;
    socketTicket?: string;
    subscribeTag?: string;
    sendMsgTag?: string;
    heartBeatTime?: number;
    debug?: boolean;
}
export declare class WebSocketFactory {
    /**
     * socket的唯一标识
     */
    private socketId;
    /**
     * socket的订阅地址
     */
    private socketUrl;
    /**
     * socketId的标识
     */
    private socketTicket;
    /**
     * ws订阅地址
     */
    private subscribeTag;
    /**
     * ws消息推送地址
     */
    private sendMsgTag;
    /**
     * 心跳时间
     * 默认一分钟
     */
    private heartBeatTime;
    /**
     * 时间轮询器
     */
    private timer;
    /**
     * 处理服务端返回消息队列的回调函数
     */
    private receiveMQCb;
    /**
     * ws连接成功的回调
     */
    private connectSucCb;
    /**
     * ws连接失败的回调
     */
    private connectErrCb;
    /**
     * stompjs（stompjs是websockets的消息协议的封装）实例
     */
    private stompClient;
    /**
     * 订阅的目标，可以是个数组，因为可以建立多个订阅目标
     */
    private subscription;
    private debug;
    constructor(webSocketObj?: WebSocketParams, MQCb?: CbType, sucCb?: CbType, errCb?: CbType);
    /**
     * 心跳发送
     */
    init(): void;
    /**
     * 停止websocket消息推送
     */
    stopConnect(): void;
    /**
     *  销毁ws实例
     */
    destroyed(): void;
    /**
     *  订阅消息 subscribe()
     *  目的地(destination) subscribeTag
     *  回调函数(callback) 处理后台推送的数据
     */
    private onConnect;
    /**
     *  轮训发送心跳
     */
    private pollSendHeartBeat;
    /**
     *  发送消息 send()
     */
    private sendMessage;
    /**
     * 推送异常
     */
    private onError;
    /**
     * 初始化配置项
     */
    private initWebSocketProp;
    /**
     * 初始化消息推送的websocket
     */
    private created;
}
export {};
