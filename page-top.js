/* On reload, show the beginning of Miami Store. In-page anchors still work during normal navigation. */
if('scrollRestoration' in history)history.scrollRestoration='manual';
const navEntry=performance.getEntriesByType?.('navigation')?.[0];
const onReload=navEntry?.type==='reload';
function showPageTop(){
 if(!onReload && location.hash)return;
 const root=document.documentElement;
 const old=root.style.scrollBehavior;
 root.style.scrollBehavior='auto';
 window.scrollTo({top:0,left:0,behavior:'instant'});
 root.style.scrollBehavior=old;
}
document.addEventListener('DOMContentLoaded',showPageTop);
window.addEventListener('pageshow',()=>requestAnimationFrame(showPageTop));
