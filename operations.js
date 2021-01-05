import {stores,transactionPromise,resolve,reject, intermediatePromise, clearData} from "./keys.js";
import { createTransaction } from "./transactions.js";


export function store(name){

    clearPreviousData.call(this);

    if(this[stores] && this[stores].find(el=>el.storename===name)){
        this[stores].forEach(el=>{
            el.active=el.storename===name;
        });
    }
    else{
        this[stores]=this[stores]??[];

        this[stores].forEach(el=>el.active=false);
        this[stores].push({
            storename:name,
            add:[],
            put:[],
            delete:[],
            get:[],
            active:true,
            operations:[]
        })
    }

    return this;
}

export function add(data){  

data=Array.isArray(data)?data:[data];    
   
return addOperation.call(this,"add",data);
}

export function put(data){
    data=Array.isArray(data)?data:[data];
    data=data.map(set=>{
        if(set.data && set.index){
            return {data:set.data,index:set.index,value:set.data[set.index],type:"put"};
        }
        else {
            throw new Error("Incorrect params passed to put method. Please ensure you pass data and index to referred.");
        }
    })
    return addOperation.call(this,"put",data);
}


export function get(data){
    
    data=Array.isArray(data)?data:[data];
    data=data.map(set=>{
        let valuepair=Object.entries(set);
        if(valuepair.length>0){
            return {index:valuepair[0][0],value:valuepair[0][1],type:"get"};
        }
        else {
            throw new Error("SimpleStore: Incorrect params passed to get method. Please ensure you pass index with value.");
        }
    })
    return addOperation.call(this,"get",data);
}

export function getAll(){

    return addOperation.call(this,"operations",["getAll"]);

}

export function clear(){

    this.commit();
    clearPreviousData.call(this);
    return addOperation.call(this,"operations",["clear"]);

}

export function deleteVal(data){
    
    data=Array.isArray(data)?data:[data];
    data=data.map(set=>{
        let valuepair=Object.entries(set);
        if(valuepair.length>0){
            return {index:valuepair[0][0],value:valuepair[0][1],type:"delete"};
        }
        else {
            throw new Error("SimpleStore: Incorrect params passed to delete method. Please ensure you pass index with value.");
        }
    })
    return addOperation.call(this,"delete",data);
}

function clearPreviousData(){
    if(!this[intermediatePromise]){

        this[clearData]([resolve,reject,stores,transactionPromise]);
    
    }
}

function addOperation(_param,data){

    if(!(this[stores] && this[stores].find(el=>el.active)))throw new Error("SimpleStore: no store called to access");

    this[stores].find(el=>el.active)[_param].push(...data);

    if(!this[intermediatePromise]){
    this[intermediatePromise]=Promise.resolve.call(Promise);
    this[intermediatePromise].then(this.commit.bind(this,'microtask-end'));
    }

    this[transactionPromise]=this[transactionPromise]??new Promise((res,rej)=>{
        this[resolve]=res;
        this[reject]=rej;
    })

    return this;
}

export function commit(microend){
    if(this[intermediatePromise]){
        this[intermediatePromise]=null;
        createTransaction.call(this);
    }
    if(microend==="microtask-end")return null;
    else return this;
}



// let storeStructure=[{
//     storename:"books",
//     add:[{}],
//     put:[{data,index,value,type}],
//     delete:[{index,value,type}],
//     get:[{index,value,type}],
//     active:false
// }]