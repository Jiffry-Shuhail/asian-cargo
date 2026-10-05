'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createAccessGuard} = require('../middleware/access');
function harness({cookie='valid', record={active:true, permissions:['legacy:operate']}, invalid=false, unavailable=false, path='/addShipment'}={}) {
    let next = false;
    const res = {statusCode:200, set(){}, status(code){this.statusCode=code;return this;}, json(body){this.body=body;return this;}};
    const guard = createAccessGuard({auth:{async verifySessionCookie(value, revoked){assert.equal(revoked,true);if(invalid)throw Error();return {uid:'operator'};}},firestore:{collection(name){assert.equal(name,'Access');return {doc(uid){assert.equal(uid,'operator');return {async get(){if(unavailable)throw Error();return {exists:record!==null,data:()=>record};}};}};}}});
    return guard({cookies:{session:cookie},path},res,()=>{next=true;}).then(()=>({res,next}));
}
for (const [name, options, expected] of [
    ['anonymous', {cookie:''},401], ['revoked', {invalid:true},401],
    ['unprovisioned', {record:null},403], ['suspended', {record:{active:false,permissions:['legacy:operate']}},403],
    ['operator cannot list users',{path:'/getAllUsers'},403],
    ['case-insensitive directory route',{path:'/GETALLUSERS/'},403],
    ['mounted directory subpath',{path:'/getAllUsers/extra'},403],
    ['permission removed',{record:{active:true,permissions:[]}},403],
    ['database unavailable',{unavailable:true},503]]) {
    test(name, async()=>{const {res,next}=await harness(options);assert.equal(res.statusCode,expected);assert.equal(next,false);});
}
test('active operator',async()=>assert.equal((await harness()).next,true));
test('directory permission',async()=>assert.equal((await harness({path:'/getAllUsers',record:{active:true,permissions:['users:read']}})).next,true));
