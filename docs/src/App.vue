<template>
	<div id="app">
		<ul>
			<li>
				<span>socketUrl: </span><input type="input" v-model="config.socketUrl"/>
			</li>
			<li>
				<span>subscribeTag: </span><input type="input" v-model="config.subscribeTag"/>
			</li>
			<li>
				<span>sendMsgTag: </span><input type="input" v-model="config.sendMsgTag"/>
			</li>
			<li>
				<span>socketTicket: </span><input type="input" v-model="config.socketTicket"/>
			</li>
			<li>
				<span>socketId: </span><input type="input" v-model="config.socketId"/>
			</li>
			<li>
				<span>debug: </span><input type="checkbox" v-model="config.debug"/>
			</li>
		</ul>
		<div style="text-align:center">
			<p>
				启动信息如下：
			</p>
			<p>
				{{info}}
			</p>
		</div>
		<div>
			<input type="button" @click="submitForm" value="开启推送">
		</div>
	</div>
</template>

<script>
import { WebSocketFactory } from '../../dist/wrapper-stompjs.es';
export default {
    name: 'app',
    data () {
		return {
			stomp: {},
			config: {
				debug: true,
				socketId: null,
				socketTicket: null,
				socketUrl: '//bg151.aqara.com:9056',
				subscribeTag: null,
				sendMsgTag: null
			},
			info: "",
		}
	},
	watch: {
		config: {
			handler: function(newValue, oldValue){
				this.initStomp();
			},
			deep: true
		}
	},
	methods: {
		initStomp() {
			this.stomp = new WebSocketFactory(
				this.config,
				(message) => {
					this.info = message;
					// 接收到推送的消息
					console.log(success);
				},
				(success) => {
					this.info = success;
					// 成功连接回调
					console.log(success);
				},
				(err) => {
					this.info = err;
					// 连接失败的回调
					console.log(err);
				}
			);
		},
		start() {
			this.stomp.init();
		},
		stop() {
			this.stomp.stopConnect();
		},
		submitForm() {
			this.stomp.init();
		}
	},
	mounted() {
		this.initStomp();
	},
}
</script>

<style>
#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	/* text-align: left; */
	color: #2c3e50;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 60px;
	flex-direction: column;
}

h1, h2 {
  	font-weight: normal;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	display: block;
	margin: 0 10px;
}

a {
  	color: #42b983;
}
</style>
