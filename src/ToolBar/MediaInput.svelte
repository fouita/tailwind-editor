<script>
    import Util from "../lib/Util"

    export let alt 
    export let src 
    export let opts
    export let klass = ''
	export let setMedia
	export let delMedia
    export let cancel
    export let media_type

	async function addMedia(){
        let is_img = await Util.testImgUrl(src.trim())
		let is_video = Util.testVideoUrl(src.trim())
		let iframe_vid = Util.parseYouTube(src.trim()) || Util.parseVimeo(src.trim())
        if(is_img || is_video || iframe_vid) {
            setMedia({
                src: iframe_vid || src,
                klass,
                alt,
                opts,
                media_type: is_img ? 'IMG': is_video ? 'VIDEO' : iframe_vid ? 'IFRAME' : 'AUDIO',
            })
        }
	}

	function cancelMedia(){
		cancel()
    }

    export let mouseX

    function firstParentRelative(n){
		while(n.parentNode && n.parentNode.tagName){
			n = n.parentNode
			if(window.getComputedStyle(n).getPropertyValue('position').toLowerCase() == 'relative'){
				return n.getBoundingClientRect()
			}
		}
		return {top: -window.scrollY, left: 0}
	}

    export let base_node
    function setPosition(node){
		let e = window.event;
		if(!base_node) return
		
		let elm = base_node.parentNode.tagName == 'DIV' ? base_node : base_node.parentNode
		let rect = elm.parentNode.getBoundingClientRect()
		let posY = rect.top; 
		if(elm.previousElementSibling){
			let ch_nodes = [...elm.parentNode.childNodes]
			let siblings = ch_nodes.slice(0,ch_nodes.indexOf(elm)+1)
			let br = siblings.reverse().find(elm => elm.tagName == 'BR')
			if(br){
				rect = br.getBoundingClientRect()
				posY = rect.top ? rect.top : posY
			}
		}
		// node.style.top = `${posY+window.scrollY}px`
        let rel_rect = firstParentRelative(node)
		let pos_top = posY-rel_rect.top
		if(posY<30)
			pos_top = 30
		node.style.top = `${pos_top}px`
		mouseX = mouseX || 10
		let mx = mouseX-node.offsetWidth/2 
		mx = mx > 0 ? mx : 10
		mx = mouseX+node.offsetWidth/2 < window.innerWidth ? mx : window.innerWidth-node.offsetWidth
		node.style.left = `${mx-rel_rect.left}px`
	}
</script>



<div use:setPosition class="absolute -mt-6 p-3 shadow-xl flex flex-col rounded text-black bg-white z-940">
    {#if src}
        <input type="text" bind:value={src} placeholder="Image src" class="bg-gray-100 text-sm font-mono mb-2 border p-1 w-64 rounded-sm outline-none shadow-inner" >
    {/if}
    {#if media_type == "IMG"}
        <input type="text" bind:value={alt} placeholder="Image alt" class="bg-gray-100 text-sm font-mono mb-2 border p-1 w-64 rounded-sm outline-none shadow-inner" >
    {/if}
    
    
    <input type="text" bind:value={klass} placeholder="Class" class="bg-gray-100 text-sm font-mono border p-1 w-64 rounded-sm outline-none shadow-inner" >

    {#if media_type == "VIDEO"}    
        <div class="text-xs my-2">
            <label class="flex items-center">
                <input class="mr-2" type="checkbox" bind:checked={opts.autoplay}>
                Autoplay
            </label>
            <label class="flex items-center">
                <input class="mr-2" type="checkbox" bind:checked={opts.muted}>
                Muted
            </label>
            <label class="flex items-center">
                <input class="mr-2" type="checkbox" bind:checked={opts.loop}>
                Loop
            </label>
            <label class="flex items-center">
                <input class="mr-2" type="checkbox" bind:checked={opts.controls}>
                Controls
            </label>
        </div>
    {/if}

    <div class="flex items-center flex-row-reverse mt-2">
        <button class="hover:bg-gray-300 px-3 rounded-sm outline-none text-xs py-1" on:click={cancelMedia}>
            Cancel
        </button>
        <button class="hover:bg-red-700 px-3 rounded-sm outline-none mx-2 bg-red-600 text-red-100 text-xs py-1" on:click={delMedia}>
            Delete
        </button>
        <button class="ml-2 hover:bg-blue-700 bg-blue-600 text-blue-100 px-3 rounded-sm outline-none text-xs py-1" on:click={addMedia}>
            Update
        </button>
    </div>
</div>

