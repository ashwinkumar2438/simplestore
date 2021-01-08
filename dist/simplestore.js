(()=>{"use strict";let e=Symbol("stores"),t=Symbol("opendb"),i=Symbol("transaction-promise"),s=Symbol("intermediate-promise"),r=Symbol("upgrade-needed"),n=Symbol("check-stores"),o=Symbol("add-instance"),a=Symbol("instance"),h=Symbol("resolve"),l=Symbol("reject"),c=Symbol("clear-data");function d(){let t=this[e].map((e=>e.storename)),i=this[e].every((e=>0===[...e.add,...e.put,...e.delete].length))?"readonly":"readwrite",s=this.db.transaction(t,i),r={};this[e].forEach((e=>{r[e.storename]=[];let t=s.objectStore(e.storename);e.add.length&&e.add.forEach((e=>{t.add(e)})),e.operations.includes("getAll")&&(e.get=[],r[e.storename]=t.getAll()),e.operations.includes("clear")&&(e.get=[],e.put=[],e.delete=[],t.clear()),[...[...e.get,...e.put,...e.delete].reduce(((e,t)=>(e.get(t.index)??e.set(t.index,new Map),e.get(t.index).get(t.value)??e.get(t.index).set(t.value,[]),e.get(t.index).get(t.value).push(t),e)),new Map).entries()].forEach((([i,s])=>{let[n,o]=1===(a=(a=[...s.keys()]).filter(((e,t)=>!1!==(e??!1)&&a.indexOf(e)===t)).sort(((e,t)=>e>t?1:-1))).length?[a,IDBKeyRange.only(a[0])]:a.length>1?[a,IDBKeyRange.bound(a[0],a[a.length-1])]:[[],""];var a;if(0===n.length)return;let h=t.index(i),l=h.unique,c=h.openKeyCursor(o),d=n.shift();c.onsuccess=i=>{let o=i.target.result;if(o){if(d!==o.key&&(d=n.shift(),d!==o.key))return o.continue(d);s.get(d).forEach((i=>{"delete"===i.type&&t.delete(o.primaryKey),"put"===i.type&&t.put(i.data,o.primaryKey),"get"===i.type&&r[e.storename].push(t.get(o.primaryKey))})),l?o.continue(d=n.shift()):o.continue()}}}))}));let n=this[h],o=this[l];s.oncomplete=()=>{let t={};Object.entries(r).forEach((([e,i])=>{t[e]=Array.isArray(i)?i.map((e=>e.result)):i.result})),n(t),this[c]([h,l,e])},s.onerror=t=>{o(t.target.error),this[c]([h,l,e])}}function u(){this[s]||this[c]([h,l,e,i])}function p(t,r){if(!this[e]||!this[e].find((e=>e.active)))throw new Error("SimpleStore: no store called to access");return this[e].find((e=>e.active))[t].push(...r),this[s]||(this[s]=Promise.resolve.call(Promise),this[s].then(this.commit.bind(this,"microtask-end"))),this[i]=this[i]??new Promise(((e,t)=>{this[h]=e,this[l]=t})),this}let m=window.indexedDB,y={value:null,enumerable:!1,writable:!0};class f{constructor(r){if(!m)throw new Error("SimpleStore: indexedDB is not supported by browser.");if(!r||r.constructor!==String)throw new Error("SimpleStore: no proper name specified for db");this.dbname=r,Object.defineProperties(this,{[h]:y,[l]:y,[i]:y,[s]:y,[e]:y}),this.stores_tested=!1,this[t](r)}[o](){this[a][this.dbname]=this[a][this.dbname]??[],this[a][this.dbname].push(this)}[t](...e){return this.request=m.open(...e),this[o](),this}addStores(e){if(Array.isArray(e))return this.storelist=JSON.parse(JSON.stringify(e)),this.request.onupgradeneeded=this[n].bind(this,!0),this.request.onsuccess=this[n].bind(this,!1),this.request.onblocked=()=>{this.db.close(),alert("SimpleStore: older version of db is open in another tab, please close/update the tabs and refresh.")},this[i]=new Promise(((e,t)=>{this[h]=e,this[l]=t})),this}[n](e){let i;if(this.db=this.request.result,this.version=this.db.version,this.db.onversionchange=()=>{this.db.close(),alert("DB is outdated,please reload the tab")},!this.stores_tested){this.storenames=this.storelist.map((e=>e.name));try{let e,t,s,r;i=this.request.transaction??this.db.transaction(this.storenames);for(let n=0;n<this.storenames.length;n++)if(e=i.objectStore(this.storenames[n]),t=e.indexNames,s=this.storelist[n],r=[...s.indices??[],...s.uniqueindices??[]],!r.every((e=>t.contains(e))))throw new Error("indice-not-found");this[h]({simplestore:this}),this[c]([h,l])}catch(s){this.stores_tested=!0,e?this[r]():new Promise((e=>{i?i.oncomplete=e:e()})).then((()=>{this[a][this.dbname].forEach((e=>{e.db&&e.db.close()})),this[a][this.dbname]=null,this[t](this.dbname,++this.version),this.request.onupgradeneeded=this[r].bind(this)}))}}}[r](){try{this.db=this.request.result,this.version=this.db.version;let e,t,i=this.db.objectStoreNames;for(let s of this.storelist)i.contains(s.name)||this.db.createObjectStore(s.name,{autoIncrement:!0}),e=this.request.transaction.objectStore(s.name),t=e.indexNames,s.indices&&s.indices.forEach((i=>{t.contains(i)||e.createIndex(i,i,{unique:!1})})),s.uniqueindices&&s.uniqueindices.forEach((i=>{t.contains(i)||e.createIndex(i,i,{unique:!0})}));this.request.transaction.oncomplete=()=>{this[h]({simplestore:this}),this[c]([h,l])}}catch(e){this[l](e),this[c]([h,l])}}[c](e){for(let t of e)this[t]=null}close(){this.db&&this.db.close(),Array.isArray(this[a][this.dbname])&&(this[a][this.dbname]=this[a][this.dbname].filter((e=>e!==this)))}}f.prototype.store=function(t){return u.call(this),this[e]&&this[e].find((e=>e.storename===t))?this[e].forEach((e=>{e.active=e.storename===t})):(this[e]=this[e]??[],this[e].forEach((e=>e.active=!1)),this[e].push({storename:t,add:[],put:[],delete:[],get:[],active:!0,operations:[]})),this},f.prototype.add=function(e){return e=Array.isArray(e)?e:[e],p.call(this,"add",e)},f.prototype.get=function(e){return e=(e=Array.isArray(e)?e:[e]).map((e=>{let t=Object.entries(e);if(t.length>0)return{index:t[0][0],value:t[0][1],type:"get"};throw new Error("SimpleStore: Incorrect params passed to get method. Please ensure you pass index with value.")})),p.call(this,"get",e)},f.prototype.put=function(e){return e=(e=Array.isArray(e)?e:[e]).map((e=>{if(e.data&&e.index)return{data:e.data,index:e.index,value:e.data[e.index],type:"put"};throw new Error("Incorrect params passed to put method. Please ensure you pass data and index to referred.")})),p.call(this,"put",e)},f.prototype.delete=function(e){return e=(e=Array.isArray(e)?e:[e]).map((e=>{let t=Object.entries(e);if(t.length>0)return{index:t[0][0],value:t[0][1],type:"delete"};throw new Error("SimpleStore: Incorrect params passed to delete method. Please ensure you pass index with value.")})),p.call(this,"delete",e)},f.prototype.getAll=function(){return p.call(this,"operations",["getAll"])},f.prototype.clear=function(){return this.commit(),u.call(this),p.call(this,"operations",["clear"])},f.prototype.then=function(e){if(e&&e.constructor===Function){if(this[i])return this[i].then(e);throw new Error("SimpleStore: no active transaction.")}},f.prototype.catch=function(e){if(e&&e.constructor===Function){if(this[i])return this[i].catch(e);throw new Error("SimpleStore: no active transaction.")}},f.prototype.finally=function(e){if(e&&e.constructor===Function){if(this[i])return this[i].finally(e);throw new Error("SimpleStore: no active transaction.")}},f.prototype.commit=function(e){return this[s]&&(this[s]=null,d.call(this)),"microtask-end"===e?null:this},Object.defineProperty(f.prototype,a,{value:{},enumerable:!1}),window.SimpleStore=f})();