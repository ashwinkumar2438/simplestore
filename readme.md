# SimpleStore
> A wrapper for indexedDB.

This project aims at making interaction with indexedDB as smooth as possible with least effort but at the same time maintaining the transactions efficient.
<br/>

## Installing / Getting started

You can easily get started by adding the below [cdn](https://cdn.jsdelivr.net/npm/simplestore-indexeddb@1.2.0/dist/simplestore.min.js):

https://cdn.jsdelivr.net/npm/simplestore-indexeddb@1.2.1/dist/simplestore.min.js

```javascript
<script src="https://cdn.jsdelivr.net/npm/simplestore-indexeddb@1.2.1/dist/simplestore.min.js"><script>
<script>
var mystore=new SimpleStore("mystore");
</script>
```

If you're using npm:
```javascript
import SimpleStore from "simplestore-indexeddb";

var mystore=new SimpleStore("mystore");

```
<br/>

### Initial Configuration
---
If the schema of your database needs to be configured/updated, it needs to be provided right away as shown below:

```javascript
mystore.addStores([{
                name:'object-store-name',
                indices:['non-unique-index'],
                uniqueindices:[
                                'unique-index-1',
                                'unique-index-2'
                                ]
                }])   
```
<br/>

## Contents
---
### Features:
* [Accessing an ObjectStore](#accessing-an-objectstore)
* [Performing Operations](#performing-operations)
* [Committing and autocommits](#committing-and-autocommits)
* [Paraller db instance version clashes](#paraller-db-instance-version-clashes)
* [Closing the db](#closing-the-db)


### Methods:
* [addStores](#addstores)
* [add](#add)
* [update](#update)
* [get](#get)
* [delete](#delete)
* [getAll](#getall)
* [clear](#clear)
* [commit](#commit)
* [close](#close)


<br>

## Features

### Accessing an ObjectStore:   

Before performing any operation, the store has to be opened in `SimpleStore` instance on which the operations have to be performed.

For example, to add a data to store `books` you can do it as shown below:

```javascript

 mystore.store("books").add({name:'mybooks'});

```
Only one store remains open at a time.

Once the store is opened, it remains open until the commit is done or another store is opened. 

The stores are not opened in the database until the commit is done.

<br/>

### Performing Operations:

Once a store is opened, you can create a chain of operations on the store:

```javascript

mystore.store("books")
       .add({name:'mybooks'})
       .put({data:{id:2,mark:false},index:"id"})
       .delete([{id:1},{id:4}])
       .store("users")
       .getAll()
       .then((res)=>{
          console.log(res.users)
        }); 

```

The response of `get` methods are segregated by store names.

<br/>

### Committing and autocommits  

To avoid multiple transactions getting created, all operations mentioned in one macro-task is wrapped into one transaction and autocommitted at the end.

However to manually override autocommit, you can call the commit method to ensure that the transaction is created right away with the mentioned operations:

```javascript

mystore.store("books")
       .add({name:'mybooks'})
       .put({data:{id:2,mark:false},index:"id"})
       .commit() //create transaction...
       .then(()=>{
           console.log("transaction successful!")
       })

```
As a transaction acts as a unit and treats operations as all or nothing, it is preferred to wrap related operations in a particular transaction to maintain integrity of the data in database.

<br/>


### Paraller db instance version clashes:

If the db is open in multiple tabs, a version update to one tab will trigger an alert in another tab to refresh the tab, as multiple versions of the same database cannot be opened at the same time.

In such cases, the older instances of the db will be closed to ensure that the new version is created successfully.

<br/>

### Closing the db:

All instances of the database are internally tracked so that in case of version clashes, the instances could be reopened.

To remove the tracking and close the db, you can simple call the close method:

```javascript
    mystore.close();
```

<br/>

## Methods

### addStores()

**Arguments:**

>`Array` of `Objects`:<br/> 
>Each `Object` has: 

|propertyname| Type | Required|
|-----|------|----|
|name|`String`|required
|indices|`Array` of `Strings`|optional|
|uniqueindices|`Array` of `Strings`|optional|

<br/>

This method is used to create/update the schema of the database by updating the version. 

Each `Object` passed in the `Array` contains the details of an ObjectStore.

The `name` of the objectStore is mandatory.

`indices` should contain the list of non unique index for the objectStore and are optional.

`uniqueindices` are similar to `indices` except the index mentioned will always carry unique values in the objectStore. Creating duplicates will lead to error.

If the mentioned schema is already present, the version is not updated.

<br/>


### add()

**Arguments:**

>`Object`  
 
 OR

>`Array` of `Objects`

<br/>

This method can add a single record to the database or a list of records. 

The primaryKeys are autogenerated.

If an `Object` is passed, it will be treated as a single record. In case of `Array` it will be treated as a list of records.

Before calling `add` method, the store has to be opened in which the operation needs to be performed.

<br/>


### update()

**Arguments:**

>`Object`  

Properties expected in `Object`:

|propertyname| Type | Required|
|-----|------|----|
|data|`Object`|required
|index|`String`|required|
 
 OR

>`Array` of `Objects`

<br/>

This method is used to update the store records with data depending on the match condition.

The `data` property takes the final record, and the `index` property takes the index name to be considered for match.

The value of the index mentioned in `index` needs to be provided in the `data` for match, otherwise no update will be performed.

If index name is not unique, then multiple records maybe updated.

Please note that the `update` method does not create a new record in case of no matches. This is a difference in execution from the `put` method in indexedDB.

Before calling `update` method, the store has to be opened in which the operation needs to be performed.

<br/>


### get()

**Arguments:**

>`Object`  

Properties expected in `Object`:

|propertyname| Type | Required|
|-----|------|----|
|[indexname]|`String`|required
 
 OR

>`Array` of `Objects`

<br/>

The get method fetched record based on index. 
The object passed should have the `indexname` based on which the search needs to be done with the value.

`indexname` can be of uniqueindex or non-unique one.

If multiple records match, all will be returned.

The `get` method returns the records in an `Array` form and are separated by stores as  shown below:

```javascript

        {
            books:[{record1},{record2}],
            users:[{record1}]
        }


```

Before calling `get` method, the store has to be opened in which the operation needs to be performed.

<br/>

### delete()

**Arguments:**

>`Object`  

Properties expected in `Object`:

|propertyname| Type | Required|
|-----|------|----|
|[indexname]|`String`|required
 
 OR

>`Array` of `Objects`

<br/>

The delete method deletes records based on index and works similar to `get` method. 

`indexname` can be of uniqueindex or non-unique one.


Before calling `delete` method, the store has to be opened in which the operation needs to be performed.

<br/>


### getAll()

This method will fetch all the data in a store and the response structure will be similar as shown in the get method. 

Any `get` method called on top of `getAll` will be ignored as `getAll` will be fetching all the data from the store.

Before calling `getAll` method, the store has to be opened in which the operation needs to be performed.

<br/>

### clear()

This method will delete all the data in a store. 

Any `delete` method called on top of `clear` will be ignored as `clear` will delete all the data from the store.

Before calling `clear` method, the store has to be opened in which the operation needs to be performed.

<br/>

### commit()

All operations are queued internally and are wrapped in one transaction. 

The transaction is auto-created once the macro-queue is cleared.

If you want to create the transaction at any point, you can call the `commit` method.

`commit` method will create the transaction and the internal queue is set to clear for the next iteration.

<br/>

### close()

A version update fails usually if an older instance of the database is still open. 

To avoid such overlaps, all instances of the db opened are tracked internally and are closed when a version update happens.

The close method will close the db and remove the instance from further tracking.

<br/>

## Live Demo
---

Here is a [live demo](https://jsfiddle.net/ashwin_kumar_coder/ftu6kyzm/) of SimpleStore in action.





