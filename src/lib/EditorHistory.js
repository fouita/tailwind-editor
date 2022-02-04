function cln(c){
    return JSON.parse(JSON.stringify(c))
}

export default {
    arr: [],
    i: -1,
    add(c){
        this.arr[++this.i] = cln(c)
        // if(this.i >= this.arr.length-1 && this.arr.length){
        //     this.arr.splice(this.i-1, this.arr.length-this.i-1)
        // }
    },
    // update current when inserting texts
    update(c){
        this.arr[this.i] = cln(c)
    },
    prev(){
        if(this.i == 0) return cln(this.arr[0])
        return cln(this.arr[--this.i])
    },
    next(){
        if(this.i >= this.arr.length-1) return cln(this.arr[this.arr.length-1])
        return cln(this.arr[++this.i])
    },
}