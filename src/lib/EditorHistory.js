export default {
    arr: [],
    i: 0,
    add(c){
        this.arr[this.i++] = JSON.parse(JSON.stringify(c))
        if(this.i >= this.arr.length-1 && this.arr.length){
            this.arr.splice(this.i-1, this.arr.length-this.i-1)
        }
    },
    prev(){
        if(this.i == 0) return this.arr[0]
        return this.arr[--this.i]
    },
    next(){
        if(this.i >= this.arr.length-1) return this.arr[this.arr.length-1]
        return this.arr[++this.i] 
    },
}