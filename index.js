import {store,add,put,get,deleteVal,commit,getAll,clear} from "./operations.js"; // all operation methods.
import {transactionPromise, //all symbol imports. 
        upgradeNeeded,
        checkStores,
        addInstance,
        instance,
        resolve,
        reject,
        clearData,
        intermediatePromise,
        opendb,
        stores
        } from "./keys.js";
        
import {_then,_catch,_finally} from "./promises.js"; //promise wrappers.


let indexedDB=window.indexedDB;

let propertyvalues={ //default property settings in constructor.
    value:null,
    enumerable:false,
    writable:true   
   }

export default class SimpleStore{

    constructor(name){
        if(!indexedDB)throw new Error("SimpleStore: indexedDB is not supported by browser.");
        if(!(name && name.constructor===String))throw new Error("SimpleStore: no proper name specified for db");
        this.dbname=name;
        
        Object.defineProperties(this,{
            [resolve]:propertyvalues,
            [reject]:propertyvalues,
            [transactionPromise]:propertyvalues,
            [intermediatePromise]:propertyvalues,
            [stores]:propertyvalues
        })
        this.stores_tested=false;
        this[opendb](name);
        
    }

    [addInstance](){
        this[instance][this.dbname]=this[instance][this.dbname]??[];
        this[instance][this.dbname].push(this);
    }

    //opendb
    [opendb](...params){    
        this.request=indexedDB.open(...params);
        this[addInstance]();
        //console.log(this.request);
        return this;
    }
    addStores(storelist){
        if(!Array.isArray(storelist))return;
        this.storelist=JSON.parse(JSON.stringify(storelist));
        this.request.onupgradeneeded=this[checkStores].bind(this,true);
        this.request.onsuccess=this[checkStores].bind(this,false);
        this.request.onblocked=()=>{
            this.db.close();
            alert("SimpleStore: older version of db is open in another tab, please close/update the tabs and refresh.");
        }
       // console.log("stores");
        this[transactionPromise]=new Promise((res,rej)=>{
            this[resolve]=res;
            this[reject]=rej;
        }).then((res)=>{
            this[transactionPromise]=null;
            return res;
        })
        return this;
    }

    [checkStores](upgradable){
        //initializing...
        this.db=this.request.result;
        this.version=this.db.version;

        //multi tab access block handlers...
        this.db.onversionchange=()=>{
            this.db.close();
            alert("DB is outdated,please reload the tab");
        }


        let transaction;

        if(this.stores_tested)return;

       this.storenames=this.storelist.map(store=>store.name); 
       try{
           
        transaction=this.request.transaction??this.db.transaction(this.storenames);
        let objectStore,indexNames,storeData,storeindices;
        for(let i=0;i<this.storenames.length;i++){
            objectStore=transaction.objectStore(this.storenames[i]);
            indexNames=objectStore.indexNames;
            storeData=this.storelist[i];
            storeindices=[...storeData.indices??[],...storeData.uniqueindices??[]];
            if(storeindices.every(name=>indexNames.contains(name)))continue;
            else throw new Error("indice-not-found");
        }  
       
        this[resolve]({simplestore:this});
        this[clearData]([resolve,reject]);
       }
       catch(err){
           //console.log(err,upgradable);
            this.stores_tested=true;
            if(upgradable)this[upgradeNeeded]();
            else {
              let closePromise=new Promise(res=>{
                  if(transaction)transaction.oncomplete=res;
                  else res();
              });
              closePromise.then(()=>{
                //close all db instances....    
                this[instance][this.dbname].forEach(request=>{
                   request.db && request.db.close();
                });
                this[instance][this.dbname]=null;
                this[opendb](this.dbname,++this.version);
                this.request.onupgradeneeded=this[upgradeNeeded].bind(this);  
              });
                 
            }
       }
    }
    
    [upgradeNeeded](){
        try{
        //initializing...
        this.db=this.request.result;
        this.version=this.db.version;

        let storenames=this.db.objectStoreNames, objectStore, indices;

        for(let store of this.storelist){
            if(!storenames.contains(store.name)){
                this.db.createObjectStore(store.name,{autoIncrement:true});
            }
            objectStore=this.request.transaction.objectStore(store.name);
            indices=objectStore.indexNames;
            store.indices && store.indices.forEach(indexname=>{
                if(!indices.contains(indexname)){
                    objectStore.createIndex(indexname,indexname,{unique:false});
                }
            })
            store.uniqueindices && store.uniqueindices.forEach(indexname=>{
                if(!indices.contains(indexname)){
                    objectStore.createIndex(indexname,indexname,{unique:true});
                }
            })

        }
        this.request.transaction.oncomplete=()=>{
            this[resolve]({simplestore:this});
            this[clearData]([resolve,reject]);
        }
       
      }
      catch(err){
         this[reject](err);
         this[clearData]([resolve,reject]); 
      }
    }

    [clearData](params){
        for(let param of params){
            this[param]=null;
        }
    }

    close(){
        this.db && this.db.close();
        if(Array.isArray(this[instance][this.dbname]))this[instance][this.dbname]=this[instance][this.dbname].filter((inst)=>inst!==this);
    }

}

SimpleStore.prototype.store=store;

SimpleStore.prototype.add=add;
SimpleStore.prototype.get=get;
SimpleStore.prototype.put=put;
SimpleStore.prototype.delete=deleteVal;
SimpleStore.prototype.getAll=getAll;
SimpleStore.prototype.clear=clear;
SimpleStore.prototype.then=_then;
SimpleStore.prototype.catch=_catch;
SimpleStore.prototype.finally=_finally;
SimpleStore.prototype.commit=commit;


Object.defineProperty(SimpleStore.prototype,instance,{
    value:{},
    enumerable:false
})

//window.SimpleStore=SimpleStore;

