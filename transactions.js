import {resolve,reject,clearData,stores} from "./keys.js";



export function createTransaction(){ //create single transaction....

    let storesTobeAccessed=this[stores].map(el=>el.storename);

    //transaction type: check if request other than get are there...
    let requestType=this[stores].every(el=>([...el.add,...el.put,...el.delete].length===0))?"readonly":"readwrite";

    let transactionRequest=this.db.transaction(storesTobeAccessed,requestType);

    let getRequests={}; //all result data....

    this[stores].forEach(element => {
        getRequests[element.storename]=[];
        let objectStore=transactionRequest.objectStore(element.storename);
        //addition of data...
        if(element.add.length){
            element.add.forEach(data=>{
                objectStore.add(data);
            })
        }
        //for get all condition...
        if(element.operations.includes("getAll")){
            element.get=[];
            getRequests[element.storename]=objectStore.getAll();
        }
        //for get all condition...
        if(element.operations.includes("clear")){
            element.get=[];
            element.put=[];
            element.delete=[];
            objectStore.clear();
        }
        //get all indice operations...
        let indices=[...element.get,...element.put,...element.delete].reduce((acc,op)=>{

            acc.get(op.index)??acc.set(op.index,new Map());

            acc.get(op.index).get(op.value)??acc.get(op.index).set(op.value,[]);

            acc.get(op.index).get(op.value).push(op);


            // if(acc[el.index])acc[el.index].push(el);
            // else acc[el.index]=[el];

            return acc;
        },new Map());
        // indices=new Map([
        //     Object.keys(indices).map(index=>([ index , objectStore.index(index) ]) )
        // ]);
        // let indexvalues=val.sort((a,b)=>a>b?1:-1);
        [...indices.entries()].forEach(([indexname,values])=>{

            let [keys,keyrange]=getIDBkeys([...values.keys()]);
            
            if(keys.length===0)return;

            let index=objectStore.index(indexname);

            let uniqueindex=index.unique;

            let cursor_req=index.openKeyCursor(keyrange);

            let currentref=keys.shift();
            cursor_req.onsuccess=(e)=>{
                let cursor=e.target.result;
                if(!cursor)return;

                if(currentref!==cursor.key){
                    currentref=keys.shift();
                    if(currentref!==cursor.key)return cursor.continue(currentref);
                }
                

                values.get(currentref).forEach(op=>{

                    if(op.type==="delete")objectStore.delete(cursor.primaryKey);
                    if(op.type==="put")objectStore.put(op.data,cursor.primaryKey);
                    if(op.type==="get"){
                        getRequests[element.storename].push(objectStore.get(cursor.primaryKey));
                    }
                    
                    
                    //////// to create flow of transaction. automatic creation and manual creation.
                })
                
                  
                uniqueindex?cursor.continue(currentref=keys.shift()):cursor.continue();

            }    


        }); //indice loop end
    });// store loop end

   let res=this[resolve],rej=this[reject]; //taking references for multiple promise calls.
   transactionRequest.oncomplete=()=>{
       let result={};
       Object.entries(getRequests).forEach(([storename,req])=>{
            result[storename]=Array.isArray(req)?req.map(r=>r.result):req.result;
       })

       res(result);
       this[clearData]([resolve,reject,stores]);
   }     

   transactionRequest.onerror=(e)=>{
       rej(e.target.error);
       this[clearData]([resolve,reject,stores]);
   }

};



function getIDBkeys(keyvalues){

    keyvalues=keyvalues.filter(el=>(el??false)===false?false:true).sort((a,b)=>a>b?1:-1);

    if(keyvalues.length===1)return [keyvalues,IDBKeyRange.only(keyvalues[0])];

    if(keyvalues.length>1)return [keyvalues,IDBKeyRange.bound(keyvalues[0],keyvalues[keyvalues.length-1])];

    else return [[],""];

}


