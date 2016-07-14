/**
 * vConsole-resouces Plugin
 *
 * @author WechatFE
 */

import './style.less';
import tplTabbox from './tabbox.html';
import tplList from './list.html';

const $ = vConsole.$;
const tool = vConsole.tool;

class VConsoleResourcesTab extends vConsole.VConsolePlugin {

  constructor(...args) {
    super(...args);

    this.$tabbox = $.render(tplTabbox, {});
    this.currentType = ''; // cookies, localstorage, ...
    this.typeNameMap = {
    	'cookies': 'Cookies',
    	'localstorage': 'LocalStorage'
    }
  }

  onRenderTab(callback) {
    callback(this.$tabbox);
  }

  onAddTool(callback) {
    let that = this;
    let toolList = [{
      name: 'Refresh',
      global: false,
      onClick: function(e) {
        that.renderResources();
      }
    }, {
      name: 'Clear',
      global: false,
      onClick: function(e) {
        that.clearLog();
      }
    }];
    callback(toolList);
  }

  onReady() {
  	let that = this;

    $.delegate($.one('.vc-sub-tabbar', that.$tabbox), 'click', '.vc-subtab', function(e) {
    	$.removeClass($.all('.vc-subtab', that.$tabbox), 'vc-actived');
    	$.addClass(this, 'vc-actived');

    	that.currentType = this.dataset.type;
    	that.renderResources();
    });

  }

  clearLog() {
  	if (this.currentType && window.confirm) {
  		let result = window.confirm('Remove all ' + this.typeNameMap[this.currentType] + '?');
  		if (!result) {
  			return false;
  		}
  	}
  	switch (this.currentType) {
  		case 'cookies':
  			this.clearCookieList();
  			break;
  		case 'localstorage':
  			this.clearLocalStorageList();
  			break;
  		default:
  			return false;
  	}
	this.renderResources();
  }

  renderResources() {
  	let list = [];

  	switch (this.currentType) {
  		case 'cookies':
  			list = this.getCookieList();
  			break;
  		case 'localstorage':
  			list = this.getLocalStorageList();
  			break;
  		default:
  			return false;
  	}

  	let $log = $.one('.vc-log', this.$tabbox);
  	if (list.length == 0) {
  		$log.innerHTML = '';
  	} else {
  		// html encode for rendering
  		for (let i=0; i<list.length; i++) {
  			list[i].name = tool.htmlEncode(list[i].name);
  			list[i].value = tool.htmlEncode(list[i].value);
  		}
  		$log.innerHTML = $.render(tplList, {list: list}, true);
  	}
  }

  getCookieList() {
  	if (!document.cookie) {
  		return [];
  	}

  	let list = [];
  	let items = document.cookie.split(';');
  	for (let i=0; i<items.length; i++) {
  		let item = items[i].split('=');
  		let name = item[0].replace(/^ /, ''),
  			value = item[1];
  		list.push({
  			name: decodeURIComponent(name),
  			value: decodeURIComponent(value)
  		});
  	}
  	return list;
  }

  getLocalStorageList() {
  	if (!window.localStorage) {
  		return [];
  	}

  	let list = []
  	for (var i = 0; i < localStorage.length; i++) {
  		let name = localStorage.key(i),
  			value = localStorage.getItem(name);
  		list.push({
  			name: name,
  			value: value
  		});
  	}
  	return list;
  }

  clearCookieList() {
  	if (!document.cookie) {
  		return;
  	}

  	let list = this.getCookieList();
  	for (var i=0; i<list.length; i++) {
  		document.cookie = list[i].name + '=;';
  	}
  }

  clearLocalStorageList() {
  	if (window.localStorage) {
  		localStorage.clear();
  	}
  }

}

let tab = new VConsoleResourcesTab('resources', 'Resources');
vConsole.addPlugin(tab);