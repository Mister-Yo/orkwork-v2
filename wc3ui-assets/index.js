(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function r(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=r(i);fetch(i.href,o)}})();const Ud=!1,Cd=(t,e)=>t===e,Bd=Symbol("solid-track"),Rn={equals:Cd};let Ja=nl;const ur=1,Fn=2,el={owned:null,cleanups:null,context:null,owner:null};var Qe=null;let yi=null,Ed=null,Ke=null,nt=null,zt=null,On=0;function An(t,e){const r=Ke,n=Qe,i=t.length===0,o=e===void 0?n:e,s=i?el:{owned:null,cleanups:null,context:o?o.context:null,owner:o},a=i?t:()=>t(()=>lr(()=>Jr(s)));Qe=s,Ke=null;try{return tn(a,!0)}finally{Ke=r,Qe=n}}function C(t,e){e=e?Object.assign({},Rn,e):Rn;const r={value:t,observers:null,observerSlots:null,comparator:e.equals||void 0},n=i=>(typeof i=="function"&&(i=i(r.value)),rl(r,i));return[tl.bind(r),n]}function me(t,e,r){const n=Zi(t,e,!1,ur);en(n)}function de(t,e,r){Ja=_d;const n=Zi(t,e,!1,ur);n.user=!0,zt?zt.push(n):en(n)}function Zr(t,e,r){r=r?Object.assign({},Rn,r):Rn;const n=Zi(t,e,!0,0);return n.observers=null,n.observerSlots=null,n.comparator=r.equals||void 0,en(n),tl.bind(n)}function lr(t){if(Ke===null)return t();const e=Ke;Ke=null;try{return t()}finally{Ke=e}}function Xt(t){de(()=>lr(t))}function ce(t){return Qe===null||(Qe.cleanups===null?Qe.cleanups=[t]:Qe.cleanups.push(t)),t}function tl(){if(this.sources&&this.state)if(this.state===ur)en(this);else{const t=nt;nt=null,tn(()=>Vn(this),!1),nt=t}if(Ke){const t=this.observers?this.observers.length:0;Ke.sources?(Ke.sources.push(this),Ke.sourceSlots.push(t)):(Ke.sources=[this],Ke.sourceSlots=[t]),this.observers?(this.observers.push(Ke),this.observerSlots.push(Ke.sources.length-1)):(this.observers=[Ke],this.observerSlots=[Ke.sources.length-1])}return this.value}function rl(t,e,r){let n=t.value;return(!t.comparator||!t.comparator(n,e))&&(t.value=e,t.observers&&t.observers.length&&tn(()=>{for(let i=0;i<t.observers.length;i+=1){const o=t.observers[i],s=yi&&yi.running;s&&yi.disposed.has(o),(s?!o.tState:!o.state)&&(o.pure?nt.push(o):zt.push(o),o.observers&&il(o)),s||(o.state=ur)}if(nt.length>1e6)throw nt=[],new Error},!1)),e}function en(t){if(!t.fn)return;Jr(t);const e=On;Ad(t,t.value,e)}function Ad(t,e,r){let n;const i=Qe,o=Ke;Ke=Qe=t;try{n=t.fn(e)}catch(s){return t.pure&&(t.state=ur,t.owned&&t.owned.forEach(Jr),t.owned=null),t.updatedAt=r+1,ol(s)}finally{Ke=o,Qe=i}(!t.updatedAt||t.updatedAt<=r)&&(t.updatedAt!=null&&"observers"in t?rl(t,n):t.value=n,t.updatedAt=r)}function Zi(t,e,r,n=ur,i){const o={fn:t,state:n,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:e,owner:Qe,context:Qe?Qe.context:null,pure:r};return Qe===null||Qe!==el&&(Qe.owned?Qe.owned.push(o):Qe.owned=[o]),o}function $n(t){if(t.state===0)return;if(t.state===Fn)return Vn(t);if(t.suspense&&lr(t.suspense.inFallback))return t.suspense.effects.push(t);const e=[t];for(;(t=t.owner)&&(!t.updatedAt||t.updatedAt<On);)t.state&&e.push(t);for(let r=e.length-1;r>=0;r--)if(t=e[r],t.state===ur)en(t);else if(t.state===Fn){const n=nt;nt=null,tn(()=>Vn(t,e[0]),!1),nt=n}}function tn(t,e){if(nt)return t();let r=!1;e||(nt=[]),zt?r=!0:zt=[],On++;try{const n=t();return Md(r),n}catch(n){r||(zt=null),nt=null,ol(n)}}function Md(t){if(nt&&(nl(nt),nt=null),t)return;const e=zt;zt=null,e.length&&tn(()=>Ja(e),!1)}function nl(t){for(let e=0;e<t.length;e++)$n(t[e])}function _d(t){let e,r=0;for(e=0;e<t.length;e++){const n=t[e];n.user?t[r++]=n:$n(n)}for(e=0;e<r;e++)$n(t[e])}function Vn(t,e){t.state=0;for(let r=0;r<t.sources.length;r+=1){const n=t.sources[r];if(n.sources){const i=n.state;i===ur?n!==e&&(!n.updatedAt||n.updatedAt<On)&&$n(n):i===Fn&&Vn(n,e)}}}function il(t){for(let e=0;e<t.observers.length;e+=1){const r=t.observers[e];r.state||(r.state=Fn,r.pure?nt.push(r):zt.push(r),r.observers&&il(r))}}function Jr(t){let e;if(t.sources)for(;t.sources.length;){const r=t.sources.pop(),n=t.sourceSlots.pop(),i=r.observers;if(i&&i.length){const o=i.pop(),s=r.observerSlots.pop();n<i.length&&(o.sourceSlots[s]=n,i[n]=o,r.observerSlots[n]=s)}}if(t.tOwned){for(e=t.tOwned.length-1;e>=0;e--)Jr(t.tOwned[e]);delete t.tOwned}if(t.owned){for(e=t.owned.length-1;e>=0;e--)Jr(t.owned[e]);t.owned=null}if(t.cleanups){for(e=t.cleanups.length-1;e>=0;e--)t.cleanups[e]();t.cleanups=null}t.state=0}function Dd(t){return t instanceof Error?t:new Error(typeof t=="string"?t:"Unknown error",{cause:t})}function ol(t,e=Qe){throw Dd(t)}const Ld=Symbol("fallback");function ps(t){for(let e=0;e<t.length;e++)t[e]()}function Rd(t,e,r={}){let n=[],i=[],o=[],s=0,a=e.length>1?[]:null;return ce(()=>ps(o)),()=>{let c=t()||[],u=c.length,l,d;return c[Bd],lr(()=>{let f,h,v,S,p,w,m,U,x;if(u===0)s!==0&&(ps(o),o=[],n=[],i=[],s=0,a&&(a=[])),r.fallback&&(n=[Ld],i[0]=An(b=>(o[0]=b,r.fallback())),s=1);else if(s===0){for(i=new Array(u),d=0;d<u;d++)n[d]=c[d],i[d]=An(g);s=u}else{for(v=new Array(u),S=new Array(u),a&&(p=new Array(u)),w=0,m=Math.min(s,u);w<m&&n[w]===c[w];w++);for(m=s-1,U=u-1;m>=w&&U>=w&&n[m]===c[U];m--,U--)v[U]=i[m],S[U]=o[m],a&&(p[U]=a[m]);for(f=new Map,h=new Array(U+1),d=U;d>=w;d--)x=c[d],l=f.get(x),h[d]=l===void 0?-1:l,f.set(x,d);for(l=w;l<=m;l++)x=n[l],d=f.get(x),d!==void 0&&d!==-1?(v[d]=i[l],S[d]=o[l],a&&(p[d]=a[l]),d=h[d],f.set(x,d)):o[l]();for(d=w;d<u;d++)d in v?(i[d]=v[d],o[d]=S[d],a&&(a[d]=p[d],a[d](d))):i[d]=An(g);i=i.slice(0,s=u),n=c.slice(0)}return i});function g(f){if(o[d]=f,a){const[h,v]=C(d);return a[d]=v,e(c[d],h)}return e(c[d])}}}function ue(t,e){return lr(()=>t(e||{}))}const Fd=t=>`Stale read from <${t}>.`;function kn(t){const e="fallback"in t&&{fallback:()=>t.fallback};return Zr(Rd(()=>t.each,t.children,e||void 0))}function vs(t){const e=t.keyed,r=Zr(()=>t.when,void 0,void 0),n=e?r:Zr(r,void 0,{equals:(i,o)=>!i==!o});return Zr(()=>{const i=n();if(i){const o=t.children;return typeof o=="function"&&o.length>0?lr(()=>o(e?i:()=>{if(!lr(n))throw Fd("Show");return r()})):o}return t.fallback},void 0,void 0)}const ft=t=>Zr(()=>t());function $d(t,e,r){let n=r.length,i=e.length,o=n,s=0,a=0,c=e[i-1].nextSibling,u=null;for(;s<i||a<o;){if(e[s]===r[a]){s++,a++;continue}for(;e[i-1]===r[o-1];)i--,o--;if(i===s){const l=o<n?a?r[a-1].nextSibling:r[o-a]:c;for(;a<o;)t.insertBefore(r[a++],l)}else if(o===a)for(;s<i;)(!u||!u.has(e[s]))&&e[s].remove(),s++;else if(e[s]===r[o-1]&&r[a]===e[i-1]){const l=e[--i].nextSibling;t.insertBefore(r[a++],e[s++].nextSibling),t.insertBefore(r[--o],l),e[i]=r[o]}else{if(!u){u=new Map;let d=a;for(;d<o;)u.set(r[d],d++)}const l=u.get(e[s]);if(l!=null)if(a<l&&l<o){let d=s,g=1,f;for(;++d<i&&d<o&&!((f=u.get(e[d]))==null||f!==l+g);)g++;if(g>l-a){const h=e[s];for(;a<l;)t.insertBefore(r[a++],h)}else t.replaceChild(r[a++],e[s++])}else s++;else e[s++].remove()}}}const bs="_$DX_DELEGATE";function Vd(t,e,r,n={}){let i;return An(o=>{i=o,e===document?t():_(e,t(),e.firstChild?null:void 0,r)},n.owner),()=>{i(),e.textContent=""}}function Y(t,e,r,n){let i;const o=()=>{const a=document.createElement("template");return a.innerHTML=t,a.content.firstChild},s=()=>(i||(i=o())).cloneNode(!0);return s.cloneNode=s,s}function ji(t,e=window.document){const r=e[bs]||(e[bs]=new Set);for(let n=0,i=t.length;n<i;n++){const o=t[n];r.has(o)||(r.add(o),e.addEventListener(o,kd))}}function le(t,e,r){r==null?t.removeAttribute(e):t.setAttribute(e,r)}function xs(t,e){e==null?t.removeAttribute("class"):t.className=e}function vn(t,e,r,n){if(n)Array.isArray(r)?(t[`$$${e}`]=r[0],t[`$$${e}Data`]=r[1]):t[`$$${e}`]=r;else if(Array.isArray(r)){const i=r[0];t.addEventListener(e,r[0]=o=>i.call(t,r[1],o))}else t.addEventListener(e,r,typeof r!="function"&&r)}function Ji(t,e,r){if(!e)return r?le(t,"style"):e;const n=t.style;if(typeof e=="string")return n.cssText=e;typeof r=="string"&&(n.cssText=r=void 0),r||(r={}),e||(e={});let i,o;for(o in r)e[o]==null&&n.removeProperty(o),delete r[o];for(o in e)i=e[o],i!==r[o]&&(n.setProperty(o,i),r[o]=i);return r}function ie(t,e,r){r!=null?t.style.setProperty(e,r):t.style.removeProperty(e)}function we(t,e,r){return lr(()=>t(e,r))}function _(t,e,r,n){if(r!==void 0&&!n&&(n=[]),typeof e!="function")return In(t,e,n,r);me(i=>In(t,e(),i,r),n)}function kd(t){let e=t.target;const r=`$$${t.type}`,n=t.target,i=t.currentTarget,o=c=>Object.defineProperty(t,"target",{configurable:!0,value:c}),s=()=>{const c=e[r];if(c&&!e.disabled){const u=e[`${r}Data`];if(u!==void 0?c.call(e,u,t):c.call(e,t),t.cancelBubble)return}return e.host&&typeof e.host!="string"&&!e.host._$host&&e.contains(t.target)&&o(e.host),!0},a=()=>{for(;s()&&(e=e._$host||e.parentNode||e.host););};if(Object.defineProperty(t,"currentTarget",{configurable:!0,get(){return e||document}}),t.composedPath){const c=t.composedPath();o(c[0]);for(let u=0;u<c.length-2&&(e=c[u],!!s());u++){if(e._$host){e=e._$host,a();break}if(e.parentNode===i)break}}else a();o(n)}function In(t,e,r,n,i){for(;typeof r=="function";)r=r();if(e===r)return r;const o=typeof e,s=n!==void 0;if(t=s&&r[0]&&r[0].parentNode||t,o==="string"||o==="number"){if(o==="number"&&(e=e.toString(),e===r))return r;if(s){let a=r[0];a&&a.nodeType===3?a.data!==e&&(a.data=e):a=document.createTextNode(e),r=Ur(t,r,n,a)}else r!==""&&typeof r=="string"?r=t.firstChild.data=e:r=t.textContent=e}else if(e==null||o==="boolean")r=Ur(t,r,n);else{if(o==="function")return me(()=>{let a=e();for(;typeof a=="function";)a=a();r=In(t,a,r,n)}),()=>r;if(Array.isArray(e)){const a=[],c=r&&Array.isArray(r);if(Xi(a,e,r,i))return me(()=>r=In(t,a,r,n,!0)),()=>r;if(a.length===0){if(r=Ur(t,r,n),s)return r}else c?r.length===0?Ss(t,a,n):$d(t,r,a):(r&&Ur(t),Ss(t,a));r=a}else if(e.nodeType){if(Array.isArray(r)){if(s)return r=Ur(t,r,n,e);Ur(t,r,null,e)}else r==null||r===""||!t.firstChild?t.appendChild(e):t.replaceChild(e,t.firstChild);r=e}}return r}function Xi(t,e,r,n){let i=!1;for(let o=0,s=e.length;o<s;o++){let a=e[o],c=r&&r[t.length],u;if(!(a==null||a===!0||a===!1))if((u=typeof a)=="object"&&a.nodeType)t.push(a);else if(Array.isArray(a))i=Xi(t,a,c)||i;else if(u==="function")if(n){for(;typeof a=="function";)a=a();i=Xi(t,Array.isArray(a)?a:[a],Array.isArray(c)?c:[c])||i}else t.push(a),i=!0;else{const l=String(a);c&&c.nodeType===3&&c.data===l?t.push(c):t.push(document.createTextNode(l))}}return i}function Ss(t,e,r=null){for(let n=0,i=e.length;n<i;n++)t.insertBefore(e[n],r)}function Ur(t,e,r,n){if(r===void 0)return t.textContent="";const i=n||document.createTextNode("");if(e.length){let o=!1;for(let s=e.length-1;s>=0;s--){const a=e[s];if(i!==a){const c=a.parentNode===t;!o&&!s?c?t.replaceChild(i,a):t.insertBefore(i,r):c&&a.remove()}else o=!0}}else t.insertBefore(i,r);return[i]}var Qr=(t=>(t[t.WrapWidth=1]="WrapWidth",t[t.WrapHeight=2]="WrapHeight",t))(Qr||{}),Re=(t=>(t[t.None=0]="None",t[t.Transparent=1]="Transparent",t[t.Blend=2]="Blend",t[t.Additive=3]="Additive",t[t.AddAlpha=4]="AddAlpha",t[t.Modulate=5]="Modulate",t[t.Modulate2x=6]="Modulate2x",t))(Re||{}),bt=(t=>(t[t.DontInterp=0]="DontInterp",t[t.Linear=1]="Linear",t[t.Hermite=2]="Hermite",t[t.Bezier=3]="Bezier",t))(bt||{}),Tt=(t=>(t[t.Unshaded=1]="Unshaded",t[t.SphereEnvMap=2]="SphereEnvMap",t[t.TwoSided=16]="TwoSided",t[t.Unfogged=32]="Unfogged",t[t.NoDepthTest=64]="NoDepthTest",t[t.NoDepthSet=128]="NoDepthSet",t))(Tt||{}),ir=(t=>(t[t.DontInheritTranslation=1]="DontInheritTranslation",t[t.DontInheritRotation=2]="DontInheritRotation",t[t.DontInheritScaling=4]="DontInheritScaling",t[t.Billboarded=8]="Billboarded",t[t.BillboardedLockX=16]="BillboardedLockX",t[t.BillboardedLockY=32]="BillboardedLockY",t[t.BillboardedLockZ=64]="BillboardedLockZ",t[t.CameraAnchored=128]="CameraAnchored",t))(ir||{}),Wi=(t=>(t[t.Box=0]="Box",t[t.Sphere=2]="Sphere",t))(Wi||{}),Mn=(t=>(t[t.Unshaded=32768]="Unshaded",t[t.SortPrimsFarZ=65536]="SortPrimsFarZ",t[t.LineEmitter=131072]="LineEmitter",t[t.Unfogged=262144]="Unfogged",t[t.ModelSpace=524288]="ModelSpace",t[t.XYQuad=1048576]="XYQuad",t))(Mn||{}),vt=(t=>(t[t.Blend=0]="Blend",t[t.Additive=1]="Additive",t[t.Modulate=2]="Modulate",t[t.Modulate2x=3]="Modulate2x",t[t.AlphaKey=4]="AlphaKey",t))(vt||{}),De=(t=>(t[t.Head=1]="Head",t[t.Tail=2]="Tail",t))(De||{});function bn(t,e,r){const n=e[0],i=e[1],o=e[2],s=e[3],a=n+n,c=i+i,u=o+o,l=n*a,d=n*c,g=n*u,f=i*c,h=i*u,v=o*u,S=s*a,p=s*c,w=s*u,m=r[0],U=r[1],x=r[2];return t[0]=1-(f+v),t[1]=d+w,t[2]=g-p,t[3]=0,t[4]=d-w,t[5]=1-(l+v),t[6]=h+S,t[7]=0,t[8]=g+p,t[9]=h-S,t[10]=1-(l+f),t[11]=0,t[12]=m-(t[0]*m+t[4]*U+t[8]*x),t[13]=U-(t[1]*m+t[5]*U+t[9]*x),t[14]=x-(t[2]*m+t[6]*U+t[10]*x),t[15]=1,t}function Hr(t,e){return t+Math.random()*(e-t)}function Id(t){return t*Math.PI/180}function $t(t,e,r){const n=t.createShader(r);return t.shaderSource(n,e),t.compileShader(n),t.getShaderParameter(n,t.COMPILE_STATUS)?n:(alert(t.getShaderInfoLog(n)),null)}function mt(t){return t instanceof WebGL2RenderingContext}const ws=["TextureID","NormalTextureID","ORMTextureID","EmissiveTextureID","TeamColorTextureID","ReflectionsTextureID"],Ui=!0,cr=-1,Gd={0:1,1:1,2:3,3:4};class Nd{constructor(e){this.ab=e,this.pos=0,this.length=e.byteLength,this.view=new DataView(this.ab),this.uint=new Uint8Array(this.ab)}keyword(){const e=String.fromCharCode(this.uint[this.pos],this.uint[this.pos+1],this.uint[this.pos+2],this.uint[this.pos+3]);return this.pos+=4,e}expectKeyword(e,r){if(this.keyword()!==e)throw new Error(r)}uint8(){return this.view.getUint8(this.pos++)}uint16(){const e=this.view.getUint16(this.pos,Ui);return this.pos+=2,e}int32(){const e=this.view.getInt32(this.pos,Ui);return this.pos+=4,e}float32(){const e=this.view.getFloat32(this.pos,Ui);return this.pos+=4,e}float32Array(e){const r=new Float32Array(e);for(let n=0;n<e;++n)r[n]=this.float32();return r}uint8Array(e){const r=new Uint8Array(e);for(let n=0;n<e;++n)r[n]=this.uint8();return r}str(e){let r=e;for(;this.uint[this.pos+r-1]===0&&r>0;)--r;const n=String.fromCharCode.apply(String,this.uint.slice(this.pos,this.pos+r));return this.pos+=e,n}animVector(e){const r={Keys:[]},n=e===0,i=Gd[e],o=this.int32();r.LineType=this.int32(),r.GlobalSeqId=this.int32(),r.GlobalSeqId===cr&&(r.GlobalSeqId=null);for(let s=0;s<o;++s){const a={};a.Frame=this.int32(),n?a.Vector=new Int32Array(i):a.Vector=new Float32Array(i);for(let c=0;c<i;++c)n?a.Vector[c]=this.int32():a.Vector[c]=this.float32();if(r.LineType===bt.Hermite||r.LineType===bt.Bezier)for(const c of["InTan","OutTan"]){a[c]=new Float32Array(i);for(let u=0;u<i;++u)n?a[c][u]=this.int32():a[c][u]=this.float32()}r.Keys.push(a)}return r}}function Gn(t,e){t.BoundsRadius=e.float32();for(const r of["MinimumExtent","MaximumExtent"]){t[r]=new Float32Array(3);for(let n=0;n<3;++n)t[r][n]=e.float32()}}function Od(t,e){t.Version=e.int32()}const Hd=336;function zd(t,e){t.Info.Name=e.str(Hd),e.int32(),Gn(t.Info,e),t.Info.BlendTime=e.int32()}const Xd=80;function Wd(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i=e.str(Xd),o={};o.Name=i;const s=new Uint32Array(2);s[0]=e.int32(),s[1]=e.int32(),o.Interval=s,o.MoveSpeed=e.float32(),o.NonLooping=e.int32()>0,o.Rarity=e.float32(),e.int32(),Gn(o,e),t.Sequences.push(o)}}function qd(t,e,r){const n=e.pos;for(;e.pos<n+r;){e.int32();const i={Layers:[]};i.PriorityPlane=e.int32(),i.RenderMode=e.int32(),t.Version>=900&&t.Version<1100&&(i.Shader=e.str(80)),e.expectKeyword("LAYS","Incorrect materials format");const o=e.int32();for(let s=0;s<o;++s){const a=e.pos,c=e.int32(),u={};if(u.FilterMode=e.int32(),u.Shading=e.int32(),u.TextureID=e.int32(),u.TVertexAnimId=e.int32(),u.TVertexAnimId===cr&&(u.TVertexAnimId=null),u.CoordId=e.int32(),u.Alpha=e.float32(),t.Version>=900&&(u.EmissiveGain=e.float32(),t.Version>=1e3&&(u.FresnelColor=e.float32Array(3),u.FresnelOpacity=e.float32(),u.FresnelTeamColor=e.float32())),t.Version>=1100){u.ShaderTypeId=e.int32();const l=e.int32();for(let d=0;d<l;++d){const g=e.int32();e.int32();const f=d;e.keyword()==="KMTF"?u[ws[f]]=e.animVector(0):(u[ws[f]]=g,e.pos-=4)}}for(;e.pos<a+c;){const l=e.keyword();if(l==="KMTA")u.Alpha=e.animVector(1);else if(l==="KMTF")u.TextureID=e.animVector(0);else if(l==="KMTE"&&t.Version>=900)u.EmissiveGain=e.animVector(1);else if(l==="KFC3"&&t.Version>=1e3)u.FresnelColor=e.animVector(2);else if(l==="KFCA"&&t.Version>=1e3)u.FresnelOpacity=e.animVector(1);else if(l==="KFTC"&&t.Version>=1e3)u.FresnelTeamColor=e.animVector(1);else throw new Error("Unknown layer chunk data "+l)}i.Layers.push(u)}t.Materials.push(i)}}const Yd=256;function Kd(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i={};i.ReplaceableId=e.int32(),i.Image=e.str(Yd),e.int32(),i.Flags=e.int32(),t.Textures.push(i)}}function Qd(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i={};e.int32(),e.expectKeyword("VRTX","Incorrect geosets format");const o=e.int32();i.Vertices=new Float32Array(o*3);for(let p=0;p<o*3;++p)i.Vertices[p]=e.float32();e.expectKeyword("NRMS","Incorrect geosets format");const s=e.int32();i.Normals=new Float32Array(s*3);for(let p=0;p<s*3;++p)i.Normals[p]=e.float32();e.expectKeyword("PTYP","Incorrect geosets format");const a=e.int32();for(let p=0;p<a;++p)if(e.int32()!==4)throw new Error("Incorrect geosets format");e.expectKeyword("PCNT","Incorrect geosets format");const c=e.int32();for(let p=0;p<c;++p)e.int32();e.expectKeyword("PVTX","Incorrect geosets format");const u=e.int32();i.Faces=new Uint16Array(u);for(let p=0;p<u;++p)i.Faces[p]=e.uint16();e.expectKeyword("GNDX","Incorrect geosets format");const l=e.int32();i.VertexGroup=new Uint8Array(l);for(let p=0;p<l;++p)i.VertexGroup[p]=e.uint8();e.expectKeyword("MTGC","Incorrect geosets format");const d=e.int32();i.Groups=[];for(let p=0;p<d;++p)i.Groups[p]=new Array(e.int32());e.expectKeyword("MATS","Incorrect geosets format"),i.TotalGroupsCount=e.int32();let g=0,f=0;for(let p=0;p<i.TotalGroupsCount;++p)g>=i.Groups[f].length&&(g=0,f++),i.Groups[f][g++]=e.int32();i.MaterialID=e.int32(),i.SelectionGroup=e.int32(),i.Unselectable=e.int32()>0,t.Version>=900&&(i.LevelOfDetail=e.int32(),i.Name=e.str(80)),Gn(i,e);const h=e.int32();i.Anims=[];for(let p=0;p<h;++p){const w={};Gn(w,e),i.Anims.push(w)}let v=e.keyword();if(t.Version>=900)for(;;){if(e.pos>=e.length)throw new Error("Unexpected EOF");if(v==="TANG"){if(i.Tangents)throw new Error("Incorrect geoset, multiple Tangents");const p=e.int32();i.Tangents=e.float32Array(p*4)}else if(v==="SKIN"){if(i.SkinWeights)throw new Error("Incorrect geoset, multiple SkinWeights");const p=e.int32();i.SkinWeights=e.uint8Array(p)}else if(v==="UVAS")break;v=e.keyword()}else if(v!=="UVAS")throw new Error("Incorrect geosets format");const S=e.int32();i.TVertices=[];for(let p=0;p<S;++p){e.expectKeyword("UVBS","Incorrect geosets format");const w=e.int32(),m=new Float32Array(w*2);for(let U=0;U<w*2;++U)m[U]=e.float32();i.TVertices.push(m)}t.Geosets.push(i)}}function Zd(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i=e.pos,o=e.int32(),s={};s.Alpha=e.float32(),s.Flags=e.int32(),s.Color=new Float32Array(3);for(let a=0;a<3;++a)s.Color[a]=e.float32();for(s.GeosetId=e.int32(),s.GeosetId===cr&&(s.GeosetId=null);e.pos<i+o;){const a=e.keyword();if(a==="KGAO")s.Alpha=e.animVector(1);else if(a==="KGAC")s.Color=e.animVector(2);else throw new Error("Incorrect GeosetAnim chunk data "+a)}t.GeosetAnims.push(s)}}const jd=80;function It(t,e,r){const n=r.pos,i=r.int32();for(e.Name=r.str(jd),e.ObjectId=r.int32(),e.ObjectId===cr&&(e.ObjectId=null),e.Parent=r.int32(),e.Parent===cr&&(e.Parent=null),e.Flags=r.int32();r.pos<n+i;){const o=r.keyword();if(o==="KGTR")e.Translation=r.animVector(2);else if(o==="KGRT")e.Rotation=r.animVector(3);else if(o==="KGSC")e.Scaling=r.animVector(2);else throw new Error("Incorrect node chunk data "+o)}t.Nodes[e.ObjectId]=e}function Jd(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i={};It(t,i,e),i.GeosetId=e.int32(),i.GeosetId===cr&&(i.GeosetId=null),i.GeosetAnimId=e.int32(),i.GeosetAnimId===cr&&(i.GeosetAnimId=null),t.Bones.push(i)}}function ef(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i={};It(t,i,e),t.Helpers.push(i)}}const tf=256;function rf(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i=e.pos,o=e.int32(),s={};It(t,s,e),s.Path=e.str(tf),e.int32(),s.AttachmentID=e.int32(),e.pos<i+o&&(e.expectKeyword("KATV","Incorrect attachment chunk data"),s.Visibility=e.animVector(1)),t.Attachments.push(s)}}function nf(t,e,r){const n=r/12;for(let i=0;i<n;++i)t.PivotPoints[i]=new Float32Array(3),t.PivotPoints[i][0]=e.float32(),t.PivotPoints[i][1]=e.float32(),t.PivotPoints[i][2]=e.float32()}function of(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i={};It(t,i,e),e.expectKeyword("KEVT","Incorrect EventObject chunk data");const o=e.int32();i.EventTrack=new Uint32Array(o),e.int32();for(let s=0;s<o;++s)i.EventTrack[s]=e.int32();t.EventObjects.push(i)}}function sf(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i={};It(t,i,e),i.Shape=e.int32(),i.Shape===Wi.Box?i.Vertices=new Float32Array(6):i.Vertices=new Float32Array(3);for(let o=0;o<i.Vertices.length;++o)i.Vertices[o]=e.float32();i.Shape===Wi.Sphere&&(i.BoundsRadius=e.float32()),t.CollisionShapes.push(i)}}function af(t,e,r){const n=e.pos;for(t.GlobalSequences=[];e.pos<n+r;)t.GlobalSequences.push(e.int32())}const lf=256;function cf(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i=e.pos,o=e.int32(),s={};for(It(t,s,e),s.EmissionRate=e.float32(),s.Gravity=e.float32(),s.Longitude=e.float32(),s.Latitude=e.float32(),s.Path=e.str(lf),e.int32(),s.LifeSpan=e.float32(),s.InitVelocity=e.float32();e.pos<i+o;){const a=e.keyword();if(a==="KPEV")s.Visibility=e.animVector(1);else if(a==="KPEE")s.EmissionRate=e.animVector(1);else if(a==="KPEG")s.Gravity=e.animVector(1);else if(a==="KPLN")s.Longitude=e.animVector(1);else if(a==="KPLT")s.Latitude=e.animVector(1);else if(a==="KPEL")s.LifeSpan=e.animVector(1);else if(a==="KPES")s.InitVelocity=e.animVector(1);else throw new Error("Incorrect particle emitter chunk data "+a)}t.ParticleEmitters.push(s)}}function uf(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i=e.pos,o=e.int32(),s={};It(t,s,e),s.Speed=e.float32(),s.Variation=e.float32(),s.Latitude=e.float32(),s.Gravity=e.float32(),s.LifeSpan=e.float32(),s.EmissionRate=e.float32(),s.Width=e.float32(),s.Length=e.float32(),s.FilterMode=e.int32(),s.Rows=e.int32(),s.Columns=e.int32();const a=e.int32();s.FrameFlags=0,(a===0||a===2)&&(s.FrameFlags|=De.Head),(a===1||a===2)&&(s.FrameFlags|=De.Tail),s.TailLength=e.float32(),s.Time=e.float32(),s.SegmentColor=[];for(let c=0;c<3;++c){s.SegmentColor[c]=new Float32Array(3);for(let u=0;u<3;++u)s.SegmentColor[c][u]=e.float32()}s.Alpha=new Uint8Array(3);for(let c=0;c<3;++c)s.Alpha[c]=e.uint8();s.ParticleScaling=new Float32Array(3);for(let c=0;c<3;++c)s.ParticleScaling[c]=e.float32();for(const c of["LifeSpanUVAnim","DecayUVAnim","TailUVAnim","TailDecayUVAnim"]){s[c]=new Uint32Array(3);for(let u=0;u<3;++u)s[c][u]=e.int32()}for(s.TextureID=e.int32(),s.TextureID===cr&&(s.TextureID=null),s.Squirt=e.int32()>0,s.PriorityPlane=e.int32(),s.ReplaceableId=e.int32();e.pos<i+o;){const c=e.keyword();if(c==="KP2V")s.Visibility=e.animVector(1);else if(c==="KP2E")s.EmissionRate=e.animVector(1);else if(c==="KP2W")s.Width=e.animVector(1);else if(c==="KP2N")s.Length=e.animVector(1);else if(c==="KP2S")s.Speed=e.animVector(1);else if(c==="KP2L")s.Latitude=e.animVector(1);else if(c==="KP2G")s.Gravity=e.animVector(1);else if(c==="KP2R")s.Variation=e.animVector(1);else throw new Error("Incorrect particle emitter2 chunk data "+c)}t.ParticleEmitters2.push(s)}}const df=80;function ff(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i=e.pos,o=e.int32(),s={};for(s.Name=e.str(df),s.Position=new Float32Array(3),s.Position[0]=e.float32(),s.Position[1]=e.float32(),s.Position[2]=e.float32(),s.FieldOfView=e.float32(),s.FarClip=e.float32(),s.NearClip=e.float32(),s.TargetPosition=new Float32Array(3),s.TargetPosition[0]=e.float32(),s.TargetPosition[1]=e.float32(),s.TargetPosition[2]=e.float32();e.pos<i+o;){const a=e.keyword();if(a==="KCTR")s.Translation=e.animVector(2);else if(a==="KTTR")s.TargetTranslation=e.animVector(2);else if(a==="KCRL")s.Rotation=e.animVector(1);else throw new Error("Incorrect camera chunk data "+a)}t.Cameras.push(s)}}function hf(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i=e.pos,o=e.int32(),s={};It(t,s,e),s.LightType=e.int32(),s.AttenuationStart=e.float32(),s.AttenuationEnd=e.float32(),s.Color=new Float32Array(3);for(let a=0;a<3;++a)s.Color[a]=e.float32();s.Intensity=e.float32(),s.AmbColor=new Float32Array(3);for(let a=0;a<3;++a)s.AmbColor[a]=e.float32();for(s.AmbIntensity=e.float32();e.pos<i+o;){const a=e.keyword();if(a==="KLAV")s.Visibility=e.animVector(1);else if(a==="KLAC")s.Color=e.animVector(2);else if(a==="KLAI")s.Intensity=e.animVector(1);else if(a==="KLBC")s.AmbColor=e.animVector(2);else if(a==="KLBI")s.AmbIntensity=e.animVector(1);else if(a==="KLAS")s.AttenuationStart=e.animVector(0);else if(a==="KLAE")s.AttenuationEnd=e.animVector(0);else throw new Error("Incorrect light chunk data "+a)}t.Lights.push(s)}}function gf(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i=e.pos,o=e.int32(),s={};for(;e.pos<i+o;){const a=e.keyword();if(a==="KTAT")s.Translation=e.animVector(2);else if(a==="KTAR")s.Rotation=e.animVector(3);else if(a==="KTAS")s.Scaling=e.animVector(2);else throw new Error("Incorrect light chunk data "+a)}t.TextureAnims.push(s)}}function mf(t,e,r){const n=e.pos;for(;e.pos<n+r;){const i=e.pos,o=e.int32(),s={};It(t,s,e),s.HeightAbove=e.float32(),s.HeightBelow=e.float32(),s.Alpha=e.float32(),s.Color=new Float32Array(3);for(let a=0;a<3;++a)s.Color[a]=e.float32();for(s.LifeSpan=e.float32(),s.TextureSlot=e.int32(),s.EmissionRate=e.int32(),s.Rows=e.int32(),s.Columns=e.int32(),s.MaterialID=e.int32(),s.Gravity=e.float32();e.pos<i+o;){const a=e.keyword();if(a==="KRVS")s.Visibility=e.animVector(1);else if(a==="KRHA")s.HeightAbove=e.animVector(1);else if(a==="KRHB")s.HeightBelow=e.animVector(1);else if(a==="KRAL")s.Alpha=e.animVector(1);else if(a==="KRTX")s.TextureSlot=e.animVector(0);else throw new Error("Incorrect ribbon emitter chunk data "+a)}t.RibbonEmitters.push(s)}}function pf(t,e,r){if(t.Version<900)throw new Error("Mismatched version chunk");const n=e.pos;for(t.FaceFX=t.FaceFX||[];e.pos<n+r;){const i={Name:"",Path:""};i.Name=e.str(80),i.Path=e.str(260),t.FaceFX.push(i)}}function vf(t,e,r){if(t.Version<900)throw new Error("Mismatched version chunk");const n=e.pos;t.BindPoses=t.BindPoses||[];const i=e.int32(),o={Matrices:[]};for(let s=0;s<i;++s){const a=e.float32Array(12);o.Matrices.push(a)}if(t.BindPoses.push(o),e.pos!==n+r)throw new Error("Mismatched BindPose data")}function bf(t,e,r){if(t.Version<900)throw new Error("Mismatched version chunk");const n=e.pos;for(t.ParticleEmitterPopcorns=t.ParticleEmitterPopcorns||[];e.pos<n+r;){const i=e.pos,o=e.int32(),s={};for(It(t,s,e),s.LifeSpan=e.float32(),s.EmissionRate=e.float32(),s.Speed=e.float32(),s.Color=e.float32Array(3),s.Alpha=e.float32(),s.ReplaceableId=e.int32(),s.Path=e.str(260),s.AnimVisibilityGuide=e.str(260);e.pos<i+o;){const a=e.keyword();if(a==="KPPA")s.Alpha=e.animVector(1);else if(a==="KPPC")s.Color=e.animVector(2);else if(a==="KPPE")s.EmissionRate=e.animVector(1);else if(a==="KPPL")s.LifeSpan=e.animVector(1);else if(a==="KPPS")s.Speed=e.animVector(1);else if(a==="KPPV")s.Visibility=e.animVector(1);else throw new Error("Incorrect particle emitter popcorn chunk data "+a)}t.ParticleEmitterPopcorns.push(s)}}const Ps={VERS:Od,MODL:zd,SEQS:Wd,MTLS:qd,TEXS:Kd,GEOS:Qd,GEOA:Zd,BONE:Jd,HELP:ef,ATCH:rf,PIVT:nf,EVTS:of,CLID:sf,GLBS:af,PREM:cf,PRE2:uf,CAMS:ff,LITE:hf,TXAN:gf,RIBB:mf,FAFX:pf,BPOS:vf,CORN:bf};function Hn(t){const e=new Nd(t);if(e.keyword()!=="MDLX")throw new Error("Not a mdx model");const r={Version:800,Info:{Name:"",MinimumExtent:null,MaximumExtent:null,BoundsRadius:0,BlendTime:150},Sequences:[],GlobalSequences:[],Textures:[],Materials:[],TextureAnims:[],Geosets:[],GeosetAnims:[],Bones:[],Helpers:[],Attachments:[],EventObjects:[],ParticleEmitters:[],ParticleEmitters2:[],Cameras:[],Lights:[],RibbonEmitters:[],CollisionShapes:[],PivotPoints:[],Nodes:[]};for(;e.pos<e.length;){const n=e.keyword(),i=e.int32();n in Ps?Ps[n](r,e,i):e.pos+=i}for(let n=0;n<r.Nodes.length;++n)r.Nodes[n]&&r.PivotPoints[n]&&(r.Nodes[n].PivotPoint=r.PivotPoints[n]);return r.Info.NumGeosets=r.Geosets.length,r.Info.NumGeosetAnims=r.GeosetAnims.length,r.Info.NumBones=r.Bones.length,r.Info.NumLights=r.Lights.length,r.Info.NumAttachments=r.Attachments.length,r.Info.NumEvents=r.EventObjects.length,r.Info.NumParticleEmitters=r.ParticleEmitters.length,r.Info.NumParticleEmitters2=r.ParticleEmitters2.length,r.Info.NumRibbonEmitters=r.RibbonEmitters.length,r}var sl=(t=>(t[t.BLP0=0]="BLP0",t[t.BLP1=1]="BLP1",t[t.BLP2=2]="BLP2",t))(sl||{}),jr=(t=>(t[t.JPEG=0]="JPEG",t[t.Direct=1]="Direct",t))(jr||{}),xf=(function(){var e=new Int32Array([0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63]),r=4017,n=799,i=3406,o=2276,s=1567,a=3784,c=5793,u=2896;function l(){}function d(p,w){for(var m=0,U=[],x,b,y=16;y>0&&!p[y-1];)y--;U.push({children:[],index:0});var T=U[0],P;for(x=0;x<y;x++){for(b=0;b<p[x];b++){for(T=U.pop(),T.children[T.index]=w[m];T.index>0;)T=U.pop();for(T.index++,U.push(T);U.length<=x;)U.push(P={children:[],index:0}),T.children[T.index]=P.children,T=P;m++}x+1<y&&(U.push(P={children:[],index:0}),T.children[T.index]=P.children,T=P)}return U[0].children}function g(p,w,m){return 64*((p.blocksPerLine+1)*w+m)}function f(p,w,m,U,x,b,y,T,P){m.precision,m.samplesPerLine,m.scanLines;var k=m.mcusPerLine,L=m.progressive;m.maxH,m.maxV;var N=w,D=0,V=0;function $(){if(V>0)return V--,D>>V&1;if(D=p[w++],D==255){var ve=p[w++];if(ve)throw"unexpected marker: "+(D<<8|ve).toString(16)}return V=7,D>>>7}function I(ve){for(var Ee=ve,_e;(_e=$())!==null;){if(Ee=Ee[_e],typeof Ee=="number")return Ee;if(typeof Ee!="object")throw"invalid huffman sequence"}return null}function pe(ve){for(var Ee=0;ve>0;){var _e=$();if(_e===null)return;Ee=Ee<<1|_e,ve--}return Ee}function K(ve){var Ee=pe(ve);return Ee>=1<<ve-1?Ee:Ee+(-1<<ve)+1}function Te(ve,Ee){var _e=I(ve.huffmanTableDC),it=_e===0?0:K(_e);ve.blockData[Ee]=ve.pred+=it;for(var ye=1;ye<64;){var ke=I(ve.huffmanTableAC),Je=ke&15,tt=ke>>4;if(Je===0){if(tt<15)break;ye+=16;continue}ye+=tt;var ot=e[ye];ve.blockData[Ee+ot]=K(Je),ye++}}function Ie(ve,Ee){var _e=I(ve.huffmanTableDC),it=_e===0?0:K(_e)<<P;ve.blockData[Ee]=ve.pred+=it}function Le(ve,Ee){ve.blockData[Ee]|=$()<<P}var Oe=0;function Fe(ve,Ee){if(Oe>0){Oe--;return}for(var _e=b,it=y;_e<=it;){var ye=I(ve.huffmanTableAC),ke=ye&15,Je=ye>>4;if(ke===0){if(Je<15){Oe=pe(Je)+(1<<Je)-1;break}_e+=16;continue}_e+=Je;var tt=e[_e];ve.blockData[Ee+tt]=K(ke)*(1<<P),_e++}}var ze=0,Xe;function ct(ve,Ee){for(var _e=b,it=y,ye=0;_e<=it;){var ke=e[_e];switch(ze){case 0:var Je=I(ve.huffmanTableAC),tt=Je&15,ye=Je>>4;if(tt===0)ye<15?(Oe=pe(ye)+(1<<ye),ze=4):(ye=16,ze=1);else{if(tt!==1)throw"invalid ACn encoding";Xe=K(tt),ze=ye?2:3}continue;case 1:case 2:ve.blockData[Ee+ke]?ve.blockData[Ee+ke]+=$()<<P:(ye--,ye===0&&(ze=ze==2?3:0));break;case 3:ve.blockData[Ee+ke]?ve.blockData[Ee+ke]+=$()<<P:(ve.blockData[Ee+ke]=Xe<<P,ze=0);break;case 4:ve.blockData[Ee+ke]&&(ve.blockData[Ee+ke]+=$()<<P);break}_e++}ze===4&&(Oe--,Oe===0&&(ze=0))}function Ze(ve,Ee,_e,it,ye){var ke=_e/k|0,Je=_e%k,tt=ke*ve.v+it,ot=Je*ve.h+ye,kr=g(ve,tt,ot);Ee(ve,kr)}function ht(ve,Ee,_e){var it=_e/ve.blocksPerLine|0,ye=_e%ve.blocksPerLine,ke=g(ve,it,ye);Ee(ve,ke)}var qe=U.length,je,$e,Ge,St,ut,gt;L?b===0?gt=T===0?Ie:Le:gt=T===0?Fe:ct:gt=Te;var Ct=0,Gt,Ve;qe==1?Ve=U[0].blocksPerLine*U[0].blocksPerColumn:Ve=k*m.mcusPerColumn,x||(x=Ve);for(var wr,dr;Ct<Ve;){for($e=0;$e<qe;$e++)U[$e].pred=0;if(Oe=0,qe==1)for(je=U[0],ut=0;ut<x;ut++)ht(je,gt,Ct),Ct++;else for(ut=0;ut<x;ut++){for($e=0;$e<qe;$e++)for(je=U[$e],wr=je.h,dr=je.v,Ge=0;Ge<dr;Ge++)for(St=0;St<wr;St++)Ze(je,gt,Ct,Ge,St);Ct++}if(V=0,Gt=p[w]<<8|p[w+1],Gt<=65280)throw"marker was not found";if(Gt>=65488&&Gt<=65495)w+=2;else break}return w-N}function h(p,w,m){var U=p.quantizationTable,x,b,y,T,P,k,L,N,D,V;for(V=0;V<64;V++)m[V]=p.blockData[w+V]*U[V];for(V=0;V<8;++V){var $=8*V;if(m[1+$]==0&&m[2+$]==0&&m[3+$]==0&&m[4+$]==0&&m[5+$]==0&&m[6+$]==0&&m[7+$]==0){D=c*m[0+$]+512>>10,m[0+$]=D,m[1+$]=D,m[2+$]=D,m[3+$]=D,m[4+$]=D,m[5+$]=D,m[6+$]=D,m[7+$]=D;continue}x=c*m[0+$]+128>>8,b=c*m[4+$]+128>>8,y=m[2+$],T=m[6+$],P=u*(m[1+$]-m[7+$])+128>>8,N=u*(m[1+$]+m[7+$])+128>>8,k=m[3+$]<<4,L=m[5+$]<<4,D=x-b+1>>1,x=x+b+1>>1,b=D,D=y*a+T*s+128>>8,y=y*s-T*a+128>>8,T=D,D=P-L+1>>1,P=P+L+1>>1,L=D,D=N+k+1>>1,k=N-k+1>>1,N=D,D=x-T+1>>1,x=x+T+1>>1,T=D,D=b-y+1>>1,b=b+y+1>>1,y=D,D=P*o+N*i+2048>>12,P=P*i-N*o+2048>>12,N=D,D=k*n+L*r+2048>>12,k=k*r-L*n+2048>>12,L=D,m[0+$]=x+N,m[7+$]=x-N,m[1+$]=b+L,m[6+$]=b-L,m[2+$]=y+k,m[5+$]=y-k,m[3+$]=T+P,m[4+$]=T-P}for(V=0;V<8;++V){var I=V;if(m[8+I]==0&&m[16+I]==0&&m[24+I]==0&&m[32+I]==0&&m[40+I]==0&&m[48+I]==0&&m[56+I]==0){D=c*m[V+0]+8192>>14,m[0+I]=D,m[8+I]=D,m[16+I]=D,m[24+I]=D,m[32+I]=D,m[40+I]=D,m[48+I]=D,m[56+I]=D;continue}x=c*m[0+I]+2048>>12,b=c*m[32+I]+2048>>12,y=m[16+I],T=m[48+I],P=u*(m[8+I]-m[56+I])+2048>>12,N=u*(m[8+I]+m[56+I])+2048>>12,k=m[24+I],L=m[40+I],D=x-b+1>>1,x=x+b+1>>1,b=D,D=y*a+T*s+2048>>12,y=y*s-T*a+2048>>12,T=D,D=P-L+1>>1,P=P+L+1>>1,L=D,D=N+k+1>>1,k=N-k+1>>1,N=D,D=x-T+1>>1,x=x+T+1>>1,T=D,D=b-y+1>>1,b=b+y+1>>1,y=D,D=P*o+N*i+2048>>12,P=P*i-N*o+2048>>12,N=D,D=k*n+L*r+2048>>12,k=k*r-L*n+2048>>12,L=D,m[0+I]=x+N,m[56+I]=x-N,m[8+I]=b+L,m[48+I]=b-L,m[16+I]=y+k,m[40+I]=y-k,m[24+I]=T+P,m[32+I]=T-P}for(V=0;V<64;++V){var pe=w+V,K=m[V];K=K<=-2056?0:K>=2024?255:K+2056>>4,p.blockData[pe]=K}}function v(p,w){for(var m=w.blocksPerLine,U=w.blocksPerColumn,x=new Int32Array(64),b=0;b<U;b++)for(var y=0;y<m;y++){var T=g(w,b,y);h(w,T,x)}return w.blockData}function S(p){return p<=0?0:p>=255?255:p|0}return l.prototype={load:function(w){var m=new XMLHttpRequest;m.open("GET",w,!0),m.responseType="arraybuffer",m.onload=(function(){var U=new Uint8Array(m.response||m.mozResponseArrayBuffer);this.parse(U),this.onload&&this.onload()}).bind(this),m.send(null)},loadFromBuffer:function(w){this.parse(w),this.onload&&this.onload()},parse:function(w){function m(){var ye=w[b]<<8|w[b+1];return b+=2,ye}function U(){var ye=m(),ke=w.subarray(b,b+ye-2);return b+=ke.length,ke}function x(ye){for(var ke=Math.ceil(ye.samplesPerLine/8/ye.maxH),Je=Math.ceil(ye.scanLines/8/ye.maxV),tt=0;tt<ye.components.length;tt++){Ve=ye.components[tt];var ot=Math.ceil(Math.ceil(ye.samplesPerLine/8)*Ve.h/ye.maxH),kr=Math.ceil(Math.ceil(ye.scanLines/8)*Ve.v/ye.maxV),Wt=ke*Ve.h,Wn=Je*Ve.v,Pr=64*Wn*(Wt+1);Ve.blockData=new Int16Array(Pr),Ve.blocksPerLine=ot,Ve.blocksPerColumn=kr}ye.mcusPerLine=ke,ye.mcusPerColumn=Je}var b=0;w.length;var y=null,T=null,P,k,L=[],N=[],D=[],V=m();if(V!=65496)throw"SOI not found";for(V=m();V!=65497;){var $,I,pe;switch(V){case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:case 65534:var K=U();V===65504&&K[0]===74&&K[1]===70&&K[2]===73&&K[3]===70&&K[4]===0&&(y={version:{major:K[5],minor:K[6]},densityUnits:K[7],xDensity:K[8]<<8|K[9],yDensity:K[10]<<8|K[11],thumbWidth:K[12],thumbHeight:K[13],thumbData:K.subarray(14,14+3*K[12]*K[13])}),V===65518&&K[0]===65&&K[1]===100&&K[2]===111&&K[3]===98&&K[4]===101&&K[5]===0&&(T={version:K[6],flags0:K[7]<<8|K[8],flags1:K[9]<<8|K[10],transformCode:K[11]});break;case 65499:for(var Te=m(),Ie=Te+b-2;b<Ie;){var Le=w[b++],Oe=new Int32Array(64);if(Le>>4===0)for(I=0;I<64;I++){var Fe=e[I];Oe[Fe]=w[b++]}else if(Le>>4===1)for(I=0;I<64;I++){var Fe=e[I];Oe[Fe]=m()}else throw"DQT: invalid table spec";L[Le&15]=Oe}break;case 65472:case 65473:case 65474:if(P)throw"Only single frame JPEGs supported";m(),P={},P.extended=V===65473,P.progressive=V===65474,P.precision=w[b++],P.scanLines=m(),P.samplesPerLine=m(),P.components=[],P.componentIds={};var ze=w[b++],Xe,ct=0,Ze=0;for($=0;$<ze;$++){Xe=w[b];var ht=w[b+1]>>4,qe=w[b+1]&15;ct<ht&&(ct=ht),Ze<qe&&(Ze=qe);var je=w[b+2],pe=P.components.push({h:ht,v:qe,quantizationTable:L[je]});P.componentIds[Xe]=pe-1,b+=3}P.maxH=ct,P.maxV=Ze,x(P);break;case 65476:var $e=m();for($=2;$<$e;){var Ge=w[b++],St=new Uint8Array(16),ut=0;for(I=0;I<16;I++,b++)ut+=St[I]=w[b];var gt=new Uint8Array(ut);for(I=0;I<ut;I++,b++)gt[I]=w[b];$+=17+ut,(Ge>>4===0?D:N)[Ge&15]=d(St,gt)}break;case 65501:m(),k=m();break;case 65498:m();var Ct=w[b++],Gt=[],Ve;for($=0;$<Ct;$++){var wr=P.componentIds[w[b++]];Ve=P.components[wr];var dr=w[b++];Ve.huffmanTableDC=D[dr>>4],Ve.huffmanTableAC=N[dr&15],Gt.push(Ve)}var ve=w[b++],Ee=w[b++],_e=w[b++],it=f(w,b,P,Gt,k,ve,Ee,_e>>4,_e&15);b+=it;break;default:if(w[b-3]==255&&w[b-2]>=192&&w[b-2]<=254){b-=3;break}throw"unknown JPEG marker "+V.toString(16)}V=m()}this.width=P.samplesPerLine,this.height=P.scanLines,this.jfif=y,this.adobe=T,this.components=[];for(var $=0;$<P.components.length;$++){var Ve=P.components[$];this.components.push({output:v(P,Ve),scaleX:Ve.h/P.maxH,scaleY:Ve.v/P.maxV,blocksPerLine:Ve.blocksPerLine,blocksPerColumn:Ve.blocksPerColumn})}},getData:function(w,m,U){var x=this.width/m,b=this.height/U,y,T,P,k,L,N,D=0,V=this.components.length,$=w.data,I=new Uint8Array((this.components[0].blocksPerLine<<3)*this.components[0].blocksPerColumn*8);for(N=0;N<V;N++){y=this.components[N<3?2-N:N];for(var pe=y.blocksPerLine,K=y.blocksPerColumn,Te=pe<<3,Ie,Le,Oe=0,Fe=0;Fe<K;Fe++)for(var ze=Fe<<3,Xe=0;Xe<pe;Xe++){var ct=g(y,Fe,Xe),D=0,Ze=Xe<<3;for(Ie=0;Ie<8;Ie++){var Oe=(ze+Ie)*Te;for(Le=0;Le<8;Le++)I[Oe+Ze+Le]=y.output[ct+D++]}}T=y.scaleX*x,P=y.scaleY*b,D=N;var ht,qe,je;for(L=0;L<U;L++)for(k=0;k<m;k++)qe=0|L*P,ht=0|k*T,je=qe*Te+ht,$[D]=I[je],D+=V}return $},copyToImageData:function(w){var m=w.width,U=w.height,x=m*U*4,b=w.data,y=this.getData(m,U),T=0,P=0,k,L,N,D,V,$,I,pe,K;switch(this.components.length){case 1:for(;P<x;)N=y[T++],b[P++]=N,b[P++]=N,b[P++]=N,b[P++]=255;break;case 3:for(;P<x;)I=y[T++],pe=y[T++],K=y[T++],b[P++]=I,b[P++]=pe,b[P++]=K,b[P++]=255;break;case 4:for(;P<x;)V=y[T++],$=y[T++],N=y[T++],D=y[T++],k=255-D,L=k/255,I=S(k-V*L),pe=S(k-$*L),K=S(k-N*L),b[P++]=I,b[P++]=pe,b[P++]=K,b[P++]=255;break;default:throw"Unsupported color mode"}}},l})();function Sf(t){const e=new xf;e.loadFromBuffer(t);var r;return typeof ImageData<"u"?r=new ImageData(e.width,e.height):r={width:e.width,height:e.height,data:new Uint8ClampedArray(e.width*e.height*4)},e.getData(r,e.width,e.height),r}function wf(t,e){return String.fromCharCode(t.getUint8(e),t.getUint8(e+1),t.getUint8(e+2),t.getUint8(e+3))}function xr(t,e){return t.getUint32(e*4,!0)}function Pf(t,e,r){const n=t[Math.floor(r*e/8)],i=8/e;return n>>i-r%i-1&(1<<e)-1}function Tf(t,e){return typeof ImageData<"u"?new ImageData(t,e):{width:t,height:e,data:new Uint8ClampedArray(t*e*4),colorSpace:"srgb"}}function rn(t){const e=new DataView(t),r={type:sl.BLP1,width:0,height:0,content:jr.JPEG,alphaBits:0,mipmaps:[],data:t},n=wf(e,0);if(n==="BLP0"||n==="BLP2")throw new Error("BLP0/BLP2 not supported");if(n!=="BLP1")throw new Error("Not a blp image");if(r.content=xr(e,1),r.content!==jr.JPEG&&r.content!==jr.Direct)throw new Error("Unknown BLP content");r.alphaBits=xr(e,2),r.width=xr(e,3),r.height=xr(e,4);for(let i=0;i<16;++i){const o={offset:xr(e,7+i),size:xr(e,23+i)};if(o.size>0)r.mipmaps.push(o);else break}return r}function nn(t,e){const r=new DataView(t.data),n=new Uint8Array(t.data),i=t.mipmaps[e];if(t.content===jr.JPEG){const o=xr(r,39),s=new Uint8Array(o+i.size);return s.set(n.subarray(160,160+o)),s.set(n.subarray(i.offset,i.offset+i.size),o),Sf(s)}else{const o=new Uint8Array(t.data,156,1024),s=t.width/(1<<e),a=t.height/(1<<e),c=s*a,u=new Uint8Array(t.data,i.offset+c,Math.ceil(c*t.alphaBits/8)),l=Tf(s,a),d=255/((1<<t.alphaBits)-1);for(let g=0;g<c;++g){const f=r.getUint8(i.offset+g)*4;l.data[g*4]=o[f+2],l.data[g*4+1]=o[f+1],l.data[g*4+2]=o[f],t.alphaBits>0?l.data[g*4+3]=Pf(u,t.alphaBits,g)*d:l.data[g*4+3]=255}return l}}var _n=1e-6,lt=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var t=0,e=arguments.length;e--;)t+=arguments[e]*arguments[e];return Math.sqrt(t)});function eo(){var t=new lt(9);return lt!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[5]=0,t[6]=0,t[7]=0),t[0]=1,t[4]=1,t[8]=1,t}function Ts(t,e,r,n,i,o,s,a,c,u){return t[0]=e,t[1]=r,t[2]=n,t[3]=i,t[4]=o,t[5]=s,t[6]=a,t[7]=c,t[8]=u,t}function or(){var t=new lt(16);return lt!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t}function al(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}function yf(t,e,r){var n=e[0],i=e[1],o=e[2],s=e[3],a=e[4],c=e[5],u=e[6],l=e[7],d=e[8],g=e[9],f=e[10],h=e[11],v=e[12],S=e[13],p=e[14],w=e[15],m=r[0],U=r[1],x=r[2],b=r[3];return t[0]=m*n+U*a+x*d+b*v,t[1]=m*i+U*c+x*g+b*S,t[2]=m*o+U*u+x*f+b*p,t[3]=m*s+U*l+x*h+b*w,m=r[4],U=r[5],x=r[6],b=r[7],t[4]=m*n+U*a+x*d+b*v,t[5]=m*i+U*c+x*g+b*S,t[6]=m*o+U*u+x*f+b*p,t[7]=m*s+U*l+x*h+b*w,m=r[8],U=r[9],x=r[10],b=r[11],t[8]=m*n+U*a+x*d+b*v,t[9]=m*i+U*c+x*g+b*S,t[10]=m*o+U*u+x*f+b*p,t[11]=m*s+U*l+x*h+b*w,m=r[12],U=r[13],x=r[14],b=r[15],t[12]=m*n+U*a+x*d+b*v,t[13]=m*i+U*c+x*g+b*S,t[14]=m*o+U*u+x*f+b*p,t[15]=m*s+U*l+x*h+b*w,t}function Uf(t,e){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=e[0],t[13]=e[1],t[14]=e[2],t[15]=1,t}function Cf(t,e){var r=e[0],n=e[1],i=e[2],o=e[4],s=e[5],a=e[6],c=e[8],u=e[9],l=e[10];return t[0]=Math.hypot(r,n,i),t[1]=Math.hypot(o,s,a),t[2]=Math.hypot(c,u,l),t}function Bf(t,e){var r=new lt(3);Cf(r,e);var n=1/r[0],i=1/r[1],o=1/r[2],s=e[0]*n,a=e[1]*i,c=e[2]*o,u=e[4]*n,l=e[5]*i,d=e[6]*o,g=e[8]*n,f=e[9]*i,h=e[10]*o,v=s+l+h,S=0;return v>0?(S=Math.sqrt(v+1)*2,t[3]=.25*S,t[0]=(d-f)/S,t[1]=(g-c)/S,t[2]=(a-u)/S):s>l&&s>h?(S=Math.sqrt(1+s-l-h)*2,t[3]=(d-f)/S,t[0]=.25*S,t[1]=(a+u)/S,t[2]=(g+c)/S):l>h?(S=Math.sqrt(1+l-s-h)*2,t[3]=(g-c)/S,t[0]=(a+u)/S,t[1]=.25*S,t[2]=(d+f)/S):(S=Math.sqrt(1+h-s-l)*2,t[3]=(a-u)/S,t[0]=(g+c)/S,t[1]=(d+f)/S,t[2]=.25*S),t}function ys(t,e,r,n){var i=e[0],o=e[1],s=e[2],a=e[3],c=i+i,u=o+o,l=s+s,d=i*c,g=i*u,f=i*l,h=o*u,v=o*l,S=s*l,p=a*c,w=a*u,m=a*l,U=n[0],x=n[1],b=n[2];return t[0]=(1-(h+S))*U,t[1]=(g+m)*U,t[2]=(f-w)*U,t[3]=0,t[4]=(g-m)*x,t[5]=(1-(d+S))*x,t[6]=(v+p)*x,t[7]=0,t[8]=(f+w)*b,t[9]=(v-p)*b,t[10]=(1-(d+h))*b,t[11]=0,t[12]=r[0],t[13]=r[1],t[14]=r[2],t[15]=1,t}function Ef(t,e,r,n,i){var o=e[0],s=e[1],a=e[2],c=e[3],u=o+o,l=s+s,d=a+a,g=o*u,f=o*l,h=o*d,v=s*l,S=s*d,p=a*d,w=c*u,m=c*l,U=c*d,x=n[0],b=n[1],y=n[2],T=i[0],P=i[1],k=i[2],L=(1-(v+p))*x,N=(f+U)*x,D=(h-m)*x,V=(f-U)*b,$=(1-(g+p))*b,I=(S+w)*b,pe=(h+m)*y,K=(S-w)*y,Te=(1-(g+v))*y;return t[0]=L,t[1]=N,t[2]=D,t[3]=0,t[4]=V,t[5]=$,t[6]=I,t[7]=0,t[8]=pe,t[9]=K,t[10]=Te,t[11]=0,t[12]=r[0]+T-(L*T+V*P+pe*k),t[13]=r[1]+P-(N*T+$*P+K*k),t[14]=r[2]+k-(D*T+I*P+Te*k),t[15]=1,t}function Af(t,e,r,n,i){var o=1/Math.tan(e/2),s;return t[0]=o/r,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=o,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,i!==1/0?(s=1/(n-i),t[10]=(i+n)*s,t[14]=2*i*n*s):(t[10]=-1,t[14]=-2*n),t}function Cr(t,e,r,n){var i,o,s,a,c,u,l,d,g,f,h=e[0],v=e[1],S=e[2],p=n[0],w=n[1],m=n[2],U=r[0],x=r[1],b=r[2];return Math.abs(h-U)<_n&&Math.abs(v-x)<_n&&Math.abs(S-b)<_n?al(t):(l=h-U,d=v-x,g=S-b,f=1/Math.hypot(l,d,g),l*=f,d*=f,g*=f,i=w*g-m*d,o=m*l-p*g,s=p*d-w*l,f=Math.hypot(i,o,s),f?(f=1/f,i*=f,o*=f,s*=f):(i=0,o=0,s=0),a=d*s-g*o,c=g*i-l*s,u=l*o-d*i,f=Math.hypot(a,c,u),f?(f=1/f,a*=f,c*=f,u*=f):(a=0,c=0,u=0),t[0]=i,t[1]=a,t[2]=l,t[3]=0,t[4]=o,t[5]=c,t[6]=d,t[7]=0,t[8]=s,t[9]=u,t[10]=g,t[11]=0,t[12]=-(i*h+o*v+s*S),t[13]=-(a*h+c*v+u*S),t[14]=-(l*h+d*v+g*S),t[15]=1,t)}var xn=yf;function He(){var t=new lt(3);return lt!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function Us(t){var e=new lt(3);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function Mf(t){var e=t[0],r=t[1],n=t[2];return Math.hypot(e,r,n)}function Me(t,e,r){var n=new lt(3);return n[0]=t,n[1]=e,n[2]=r,n}function zr(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function dt(t,e,r,n){return t[0]=e,t[1]=r,t[2]=n,t}function Cs(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t[2]=e[2]+r[2],t}function _f(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t[2]=e[2]-r[2],t}function ll(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t}function to(t,e){var r=e[0],n=e[1],i=e[2],o=r*r+n*n+i*i;return o>0&&(o=1/Math.sqrt(o)),t[0]=e[0]*o,t[1]=e[1]*o,t[2]=e[2]*o,t}function Df(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]}function Rr(t,e,r){var n=e[0],i=e[1],o=e[2],s=r[0],a=r[1],c=r[2];return t[0]=i*c-o*a,t[1]=o*s-n*c,t[2]=n*a-i*s,t}function Lf(t,e,r,n){var i=e[0],o=e[1],s=e[2];return t[0]=i+n*(r[0]-i),t[1]=o+n*(r[1]-o),t[2]=s+n*(r[2]-s),t}function Rf(t,e,r,n,i,o){var s=o*o,a=s*(2*o-3)+1,c=s*(o-2)+o,u=s*(o-1),l=s*(3-2*o);return t[0]=e[0]*a+r[0]*c+n[0]*u+i[0]*l,t[1]=e[1]*a+r[1]*c+n[1]*u+i[1]*l,t[2]=e[2]*a+r[2]*c+n[2]*u+i[2]*l,t}function Ff(t,e,r,n,i,o){var s=1-o,a=s*s,c=o*o,u=a*s,l=3*o*a,d=3*c*s,g=c*o;return t[0]=e[0]*u+r[0]*l+n[0]*d+i[0]*g,t[1]=e[1]*u+r[1]*l+n[1]*d+i[1]*g,t[2]=e[2]*u+r[2]*l+n[2]*d+i[2]*g,t}function yt(t,e,r){var n=e[0],i=e[1],o=e[2],s=r[3]*n+r[7]*i+r[11]*o+r[15];return s=s||1,t[0]=(r[0]*n+r[4]*i+r[8]*o+r[12])/s,t[1]=(r[1]*n+r[5]*i+r[9]*o+r[13])/s,t[2]=(r[2]*n+r[6]*i+r[10]*o+r[14])/s,t}function cl(t,e,r){var n=r[0],i=r[1],o=r[2],s=r[3],a=e[0],c=e[1],u=e[2],l=i*u-o*c,d=o*a-n*u,g=n*c-i*a,f=i*g-o*d,h=o*l-n*g,v=n*d-i*l,S=s*2;return l*=S,d*=S,g*=S,f*=2,h*=2,v*=2,t[0]=a+l+f,t[1]=c+d+h,t[2]=u+g+v,t}function $f(t,e,r,n){var i=[],o=[];return i[0]=e[0]-r[0],i[1]=e[1]-r[1],i[2]=e[2]-r[2],o[0]=i[2]*Math.sin(n)+i[0]*Math.cos(n),o[1]=i[1],o[2]=i[2]*Math.cos(n)-i[0]*Math.sin(n),t[0]=o[0]+r[0],t[1]=o[1]+r[1],t[2]=o[2]+r[2],t}function Vf(t,e,r,n){var i=[],o=[];return i[0]=e[0]-r[0],i[1]=e[1]-r[1],i[2]=e[2]-r[2],o[0]=i[0]*Math.cos(n)-i[1]*Math.sin(n),o[1]=i[0]*Math.sin(n)+i[1]*Math.cos(n),o[2]=i[2],t[0]=o[0]+r[0],t[1]=o[1]+r[1],t[2]=o[2]+r[2],t}var Bs=_f,kf=Mf;(function(){var t=He();return function(e,r,n,i,o,s){var a,c;for(r||(r=3),n||(n=0),i?c=Math.min(i*r+n,e.length):c=e.length,a=n;a<c;a+=r)t[0]=e[a],t[1]=e[a+1],t[2]=e[a+2],o(t,t,s),e[a]=t[0],e[a+1]=t[1],e[a+2]=t[2];return e}})();function zn(){var t=new lt(4);return lt!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[3]=0),t}function If(t,e,r,n){var i=new lt(4);return i[0]=t,i[1]=e,i[2]=r,i[3]=n,i}function Gf(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t}function Nf(t,e){var r=e[0],n=e[1],i=e[2],o=e[3],s=r*r+n*n+i*i+o*o;return s>0&&(s=1/Math.sqrt(s)),t[0]=r*s,t[1]=n*s,t[2]=i*s,t[3]=o*s,t}function Of(t,e,r,n){var i=e[0],o=e[1],s=e[2],a=e[3];return t[0]=i+n*(r[0]-i),t[1]=o+n*(r[1]-o),t[2]=s+n*(r[2]-s),t[3]=a+n*(r[3]-a),t}(function(){var t=zn();return function(e,r,n,i,o,s){var a,c;for(r||(r=4),n||(n=0),i?c=Math.min(i*r+n,e.length):c=e.length,a=n;a<c;a+=r)t[0]=e[a],t[1]=e[a+1],t[2]=e[a+2],t[3]=e[a+3],o(t,t,s),e[a]=t[0],e[a+1]=t[1],e[a+2]=t[2],e[a+3]=t[3];return e}})();function Fr(){var t=new lt(4);return lt!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t[3]=1,t}function Hf(t,e,r){r=r*.5;var n=Math.sin(r);return t[0]=n*e[0],t[1]=n*e[1],t[2]=n*e[2],t[3]=Math.cos(r),t}function Dn(t,e,r,n){var i=e[0],o=e[1],s=e[2],a=e[3],c=r[0],u=r[1],l=r[2],d=r[3],g,f,h,v,S;return f=i*c+o*u+s*l+a*d,f<0&&(f=-f,c=-c,u=-u,l=-l,d=-d),1-f>_n?(g=Math.acos(f),h=Math.sin(g),v=Math.sin((1-n)*g)/h,S=Math.sin(n*g)/h):(v=1-n,S=n),t[0]=v*i+S*c,t[1]=v*o+S*u,t[2]=v*s+S*l,t[3]=v*a+S*d,t}function zf(t,e){var r=e[0],n=e[1],i=e[2],o=e[3],s=r*r+n*n+i*i+o*o,a=s?1/s:0;return t[0]=-r*a,t[1]=-n*a,t[2]=-i*a,t[3]=o*a,t}function Xf(t,e){var r=e[0]+e[4]+e[8],n;if(r>0)n=Math.sqrt(r+1),t[3]=.5*n,n=.5/n,t[0]=(e[5]-e[7])*n,t[1]=(e[6]-e[2])*n,t[2]=(e[1]-e[3])*n;else{var i=0;e[4]>e[0]&&(i=1),e[8]>e[i*3+i]&&(i=2);var o=(i+1)%3,s=(i+2)%3;n=Math.sqrt(e[i*3+i]-e[o*3+o]-e[s*3+s]+1),t[i]=.5*n,n=.5/n,t[3]=(e[o*3+s]-e[s*3+o])*n,t[o]=(e[o*3+i]+e[i*3+o])*n,t[s]=(e[s*3+i]+e[i*3+s])*n}return t}var Wf=If,qf=Gf,ul=Nf,Yf=(function(){var t=He(),e=Me(1,0,0),r=Me(0,1,0);return function(n,i,o){var s=Df(i,o);return s<-.999999?(Rr(t,e,i),kf(t)<1e-6&&Rr(t,r,i),to(t,t),Hf(n,t,Math.PI),n):s>.999999?(n[0]=0,n[1]=0,n[2]=0,n[3]=1,n):(Rr(t,i,o),n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=1+s,ul(n,n))}})(),Kf=(function(){var t=Fr(),e=Fr();return function(r,n,i,o,s,a){return Dn(t,n,s,a),Dn(e,i,o,a),Dn(r,t,e,2*a*(1-a)),r}})();(function(){var t=eo();return function(e,r,n,i){return t[0]=n[0],t[3]=n[1],t[6]=n[2],t[1]=i[0],t[4]=i[1],t[7]=i[2],t[2]=-r[0],t[5]=-r[1],t[8]=-r[2],ul(e,Xf(e,t))}})();const pt={frame:0,left:null,right:null};function qi(t,e,r){return t*(1-r)+e*r}function Qf(t,e,r,n,i){const o=1-i,s=o*o,a=i*i,c=s*o,u=3*i*s,l=3*a*o,d=a*i;return t*c+e*u+r*l+n*d}function Zf(t,e,r,n,i){const o=i*i,s=o*(2*i-3)+1,a=o*(i-2)+i,c=o*(i-1),u=o*(3-2*i);return t*s+e*a+r*c+n*u}function jf(t,e,r,n){if(!t)return null;const i=t.Keys;let o=0,s=i.length;if(s===0||i[0].Frame>n)return null;if(i[s-1].Frame<r)return null;for(;s>0;){const a=s>>1;i[o+a].Frame<=e?(o=o+a+1,s-=a+1):s=a}return o===i.length||i[o].Frame>n?o>0&&i[o-1].Frame>=r?(pt.frame=e,pt.left=i[o-1],pt.right=i[o-1],pt):null:o===0||i[o-1].Frame<r?i[o].Frame<=n?(pt.frame=e,pt.left=i[o],pt.right=i[o],pt):null:(pt.frame=e,pt.left=i[o-1],pt.right=i[o],pt)}function Jf(t,e,r,n){if(e.Frame===r.Frame)return e.Vector[0];const i=(t-e.Frame)/(r.Frame-e.Frame);return n===bt.DontInterp?e.Vector[0]:n===bt.Bezier?Qf(e.Vector[0],e.OutTan[0],r.InTan[0],r.Vector[0],i):n===bt.Hermite?Zf(e.Vector[0],e.OutTan[0],r.InTan[0],r.Vector[0],i):qi(e.Vector[0],r.Vector[0],i)}function eh(t,e,r,n,i){if(r.Frame===n.Frame)return r.Vector;const o=(e-r.Frame)/(n.Frame-r.Frame);return i===bt.DontInterp?r.Vector:i===bt.Bezier?Ff(t,r.Vector,r.OutTan,n.InTan,n.Vector,o):i===bt.Hermite?Rf(t,r.Vector,r.OutTan,n.InTan,n.Vector,o):Lf(t,r.Vector,n.Vector,o)}function th(t,e,r,n,i){if(r.Frame===n.Frame)return r.Vector;const o=(e-r.Frame)/(n.Frame-r.Frame);return i===bt.DontInterp?r.Vector:i===bt.Hermite||i===bt.Bezier?Kf(t,r.Vector,r.OutTan,n.InTan,n.Vector,o):Dn(t,r.Vector,n.Vector,o)}const gr={frame:0,from:0,to:0};class ro{static maxAnimVectorVal(e){if(typeof e=="number")return e;let r=e.Keys[0].Vector[0];for(let n=1;n<e.Keys.length;++n)e.Keys[n].Vector[0]>r&&(r=e.Keys[n].Vector[0]);return r}constructor(e){this.rendererData=e}num(e){const r=this.findKeyframes(e);return r?Jf(r.frame,r.left,r.right,e.LineType):null}vec3(e,r){const n=this.findKeyframes(r);return n?eh(e,n.frame,n.left,n.right,r.LineType):null}quat(e,r){const n=this.findKeyframes(r);return n?th(e,n.frame,n.left,n.right,r.LineType):null}animVectorVal(e,r){let n;return typeof e=="number"?n=e:(n=this.num(e),n===null&&(n=r)),n}findKeyframes(e){if(!e)return null;const{frame:r,from:n,to:i}=this.findLocalFrame(e);return jf(e,r,n,i)}findLocalFrame(e){return typeof e.GlobalSeqId=="number"?(gr.frame=this.rendererData.globalSequencesFrames[e.GlobalSeqId],gr.from=0,gr.to=this.rendererData.model.GlobalSequences[e.GlobalSeqId]):(gr.frame=this.rendererData.frame,gr.from=this.rendererData.animationInfo.Interval[0],gr.to=this.rendererData.animationInfo.Interval[1]),gr}}const rh=`attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main(void) {
    vec4 position = vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uMVMatrix * position;
    vTextureCoord = aTextureCoord;
    vColor = aColor;
}
`,nh=`precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform vec3 uReplaceableColor;
uniform float uReplaceableType;
uniform float uDiscardAlphaLevel;

float hypot (vec2 z) {
    float t;
    float x = abs(z.x);
    float y = abs(z.y);
    t = min(x, y);
    x = max(x, y);
    t = t / x;
    return (z.x == 0.0 && z.y == 0.0) ? 0.0 : x * sqrt(1.0 + t * t);
}

void main(void) {
    vec2 coords = vec2(vTextureCoord.s, vTextureCoord.t);
    if (uReplaceableType == 0.) {
        gl_FragColor = texture2D(uSampler, coords);
    } else if (uReplaceableType == 1.) {
        gl_FragColor = vec4(uReplaceableColor, 1.0);
    } else if (uReplaceableType == 2.) {
        float dist = hypot(coords - vec2(0.5, 0.5)) * 2.;
        float truncateDist = clamp(1. - dist * 1.4, 0., 1.);
        float alpha = sin(truncateDist);
        gl_FragColor = vec4(uReplaceableColor * alpha, 1.0);
    }
    gl_FragColor *= vColor;

    if (gl_FragColor[3] < uDiscardAlphaLevel) {
        discard;
    }
}
`,ih=`struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
}

struct FSUniforms {
    replaceableColor: vec3f,
    replaceableType: u32,
    discardAlphaLevel: f32,
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(1) @binding(0) var<uniform> fsUniforms: FSUniforms;
@group(1) @binding(1) var fsUniformSampler: sampler;
@group(1) @binding(2) var fsUniformTexture: texture_2d<f32>;

struct VSIn {
    @location(0) vertexPosition: vec3f,
    @location(1) textureCoord: vec2f,
    @location(2) color: vec4f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) textureCoord: vec2f,
    @location(1) color: vec4f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var position: vec4f = vec4f(in.vertexPosition, 1.0);

    var out: VSOut;
    out.position = vsUniforms.pMatrix * vsUniforms.mvMatrix * position;
    out.textureCoord = in.textureCoord;
    out.color = in.color;
    return out;
}

fn hypot(z: vec2f) -> f32 {
    var t: f32 = 0;
    var x: f32 = abs(z.x);
    let y: f32 = abs(z.y);
    t = min(x, y);
    x = max(x, y);
    t = t / x;
    if (z.x == 0.0 && z.y == 0.0) {
        return 0.0;
    }
    return x * sqrt(1.0 + t * t);
}

@fragment fn fs(
    in: VSOut
) -> @location(0) vec4f {
    let texCoord: vec2f = in.textureCoord;
    var color: vec4f = vec4f(0.0);

    if (fsUniforms.replaceableType == 0) {
        color = textureSample(fsUniformTexture, fsUniformSampler, texCoord);
    } else if (fsUniforms.replaceableType == 1) {
        color = vec4f(fsUniforms.replaceableColor, 1.0);
    } else if (fsUniforms.replaceableType == 2) {
        let dist: f32 = hypot(texCoord - vec2(0.5, 0.5)) * 2.;
        let truncateDist: f32 = clamp(1. - dist * 1.4, 0., 1.);
        let alpha: f32 = sin(truncateDist);
        color = vec4f(fsUniforms.replaceableColor * alpha, 1.0);
    }

    color *= in.color;

    // hand-made alpha-test
    if (color.a < fsUniforms.discardAlphaLevel) {
        discard;
    }

    return color;
}
`,Es=Me(0,0,0),Nt=zn(),Ot=zn(),Xr=zn(),Ht=He(),et=He(),As=.83,Ms=.01;class oh{constructor(e,r){if(this.shaderProgramLocations={vertexPositionAttribute:null,textureCoordAttribute:null,colorAttribute:null,pMatrixUniform:null,mvMatrixUniform:null,samplerUniform:null,replaceableColorUniform:null,replaceableTypeUniform:null,discardAlphaLevelUniform:null},this.particleStorage=[],this.interp=e,this.rendererData=r,this.emitters=[],r.model.ParticleEmitters2.length){this.particleBaseVectors=[He(),He(),He(),He()];for(let n=0;n<r.model.ParticleEmitters2.length;++n){const i=r.model.ParticleEmitters2[n],o={index:n,emission:0,squirtFrame:0,particles:[],props:i,capacity:0,baseCapacity:0,type:i.FrameFlags,tailVertices:null,tailVertexBuffer:null,tailVertexGPUBuffer:null,headVertices:null,headVertexBuffer:null,headVertexGPUBuffer:null,tailTexCoords:null,tailTexCoordBuffer:null,tailTexCoordGPUBuffer:null,headTexCoords:null,headTexCoordBuffer:null,headTexCoordGPUBuffer:null,colors:null,colorBuffer:null,colorGPUBuffer:null,indices:null,indexBuffer:null,indexGPUBuffer:null,fsUniformsBuffer:null};o.baseCapacity=Math.ceil(ro.maxAnimVectorVal(o.props.EmissionRate)*o.props.LifeSpan),this.emitters.push(o)}}}destroy(){this.shaderProgram&&(this.vertexShader&&(this.gl.detachShader(this.shaderProgram,this.vertexShader),this.gl.deleteShader(this.vertexShader),this.vertexShader=null),this.fragmentShader&&(this.gl.detachShader(this.shaderProgram,this.fragmentShader),this.gl.deleteShader(this.fragmentShader),this.fragmentShader=null),this.gl.deleteProgram(this.shaderProgram),this.shaderProgram=null),this.particleStorage=[],this.gpuVSUniformsBuffer&&(this.gpuVSUniformsBuffer.destroy(),this.gpuVSUniformsBuffer=null);for(const e of this.emitters)e.colorGPUBuffer&&e.colorGPUBuffer.destroy(),e.indexGPUBuffer&&e.indexGPUBuffer.destroy(),e.headVertexGPUBuffer&&e.headVertexGPUBuffer.destroy(),e.tailVertexGPUBuffer&&e.tailVertexGPUBuffer.destroy(),e.headTexCoordGPUBuffer&&e.headTexCoordGPUBuffer.destroy(),e.tailTexCoordGPUBuffer&&e.tailTexCoordGPUBuffer.destroy(),e.fsUniformsBuffer&&e.fsUniformsBuffer.destroy();this.emitters=[]}initGL(e){this.gl=e,this.initShaders()}initGPUDevice(e){this.device=e,this.gpuShaderModule=e.createShaderModule({label:"particles shader module",code:ih}),this.vsBindGroupLayout=this.device.createBindGroupLayout({label:"particles vs bind group layout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform",hasDynamicOffset:!1,minBindingSize:128}}]}),this.fsBindGroupLayout=this.device.createBindGroupLayout({label:"particles bind group layout2",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform",hasDynamicOffset:!1,minBindingSize:32}},{binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}}]}),this.gpuPipelineLayout=this.device.createPipelineLayout({label:"particles pipeline layout",bindGroupLayouts:[this.vsBindGroupLayout,this.fsBindGroupLayout]});const r=(n,i,o)=>e.createRenderPipeline({label:`particles pipeline ${n}`,layout:this.gpuPipelineLayout,vertex:{module:this.gpuShaderModule,buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]},{arrayStride:8,attributes:[{shaderLocation:1,offset:0,format:"float32x2"}]},{arrayStride:16,attributes:[{shaderLocation:2,offset:0,format:"float32x4"}]}]},fragment:{module:this.gpuShaderModule,targets:[{format:navigator.gpu.getPreferredCanvasFormat(),blend:i}]},depthStencil:o});this.gpuPipelines=[r("blend",{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"},alpha:{operation:"add",srcFactor:"one",dstFactor:"one-minus-src-alpha"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}),r("additive",{color:{operation:"add",srcFactor:"src",dstFactor:"one"},alpha:{operation:"add",srcFactor:"src",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}),r("modulate",{color:{operation:"add",srcFactor:"zero",dstFactor:"src"},alpha:{operation:"add",srcFactor:"zero",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}),r("modulate2x",{color:{operation:"add",srcFactor:"dst",dstFactor:"src"},alpha:{operation:"add",srcFactor:"zero",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}),r("alphaKey",{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one"},alpha:{operation:"add",srcFactor:"src-alpha",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"})],this.gpuVSUniformsBuffer=this.device.createBuffer({label:"particles vs uniforms",size:128,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.gpuVSUniformsBindGroup=this.device.createBindGroup({layout:this.vsBindGroupLayout,entries:[{binding:0,resource:{buffer:this.gpuVSUniformsBuffer}}]})}initShaders(){const e=this.vertexShader=$t(this.gl,rh,this.gl.VERTEX_SHADER),r=this.fragmentShader=$t(this.gl,nh,this.gl.FRAGMENT_SHADER),n=this.shaderProgram=this.gl.createProgram();this.gl.attachShader(n,e),this.gl.attachShader(n,r),this.gl.linkProgram(n),this.gl.getProgramParameter(n,this.gl.LINK_STATUS)||alert("Could not initialise shaders"),this.gl.useProgram(n),this.shaderProgramLocations.vertexPositionAttribute=this.gl.getAttribLocation(n,"aVertexPosition"),this.shaderProgramLocations.textureCoordAttribute=this.gl.getAttribLocation(n,"aTextureCoord"),this.shaderProgramLocations.colorAttribute=this.gl.getAttribLocation(n,"aColor"),this.shaderProgramLocations.pMatrixUniform=this.gl.getUniformLocation(n,"uPMatrix"),this.shaderProgramLocations.mvMatrixUniform=this.gl.getUniformLocation(n,"uMVMatrix"),this.shaderProgramLocations.samplerUniform=this.gl.getUniformLocation(n,"uSampler"),this.shaderProgramLocations.replaceableColorUniform=this.gl.getUniformLocation(n,"uReplaceableColor"),this.shaderProgramLocations.replaceableTypeUniform=this.gl.getUniformLocation(n,"uReplaceableType"),this.shaderProgramLocations.discardAlphaLevelUniform=this.gl.getUniformLocation(n,"uDiscardAlphaLevel")}updateParticle(e,r){r/=1e3,e.lifeSpan-=r,!(e.lifeSpan<=0)&&(e.speed[2]-=e.gravity*r,e.pos[0]+=e.speed[0]*r,e.pos[1]+=e.speed[1]*r,e.pos[2]+=e.speed[2]*r)}resizeEmitterBuffers(e,r){var n,i,o,s,a,c;if(r<=e.capacity)return;r=Math.max(r,e.baseCapacity);let u,l,d,g;e.type&De.Tail&&(u=new Float32Array(r*4*3),d=new Float32Array(r*4*2)),e.type&De.Head&&(l=new Float32Array(r*4*3),g=new Float32Array(r*4*2));const f=new Float32Array(r*4*4),h=new Uint16Array(r*6);e.capacity&&h.set(e.indices);for(let v=e.capacity;v<r;++v)h[v*6]=v*4,h[v*6+1]=v*4+1,h[v*6+2]=v*4+2,h[v*6+3]=v*4+2,h[v*6+4]=v*4+1,h[v*6+5]=v*4+3;u&&(e.tailVertices=u,e.tailTexCoords=d),l&&(e.headVertices=l,e.headTexCoords=g),e.colors=f,e.indices=h,e.capacity=r,e.indexBuffer||(this.gl?(e.type&De.Tail&&(e.tailVertexBuffer=this.gl.createBuffer(),e.tailTexCoordBuffer=this.gl.createBuffer()),e.type&De.Head&&(e.headVertexBuffer=this.gl.createBuffer(),e.headTexCoordBuffer=this.gl.createBuffer()),e.colorBuffer=this.gl.createBuffer(),e.indexBuffer=this.gl.createBuffer()):this.device&&(e.type&De.Tail&&((n=e.tailVertexGPUBuffer)==null||n.destroy(),e.tailVertexGPUBuffer=this.device.createBuffer({label:`particles tail vertex buffer ${e.index}`,size:u.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),(i=e.tailTexCoordGPUBuffer)==null||i.destroy(),e.tailTexCoordGPUBuffer=this.device.createBuffer({label:`particles tail texCoords buffer ${e.index}`,size:d.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST})),e.type&De.Head&&((o=e.headVertexGPUBuffer)==null||o.destroy(),e.headVertexGPUBuffer=this.device.createBuffer({label:`particles head vertex buffer ${e.index}`,size:l.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),(s=e.headTexCoordGPUBuffer)==null||s.destroy(),e.headTexCoordGPUBuffer=this.device.createBuffer({label:`particles head texCoords buffer ${e.index}`,size:g.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST})),(a=e.colorGPUBuffer)==null||a.destroy(),e.colorGPUBuffer=this.device.createBuffer({label:`particles color buffer ${e.index}`,size:f.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),(c=e.indexGPUBuffer)==null||c.destroy(),e.indexGPUBuffer=this.device.createBuffer({label:`particles index buffer ${e.index}`,size:h.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST})))}update(e){for(const r of this.emitters)this.updateEmitter(r,e)}render(e,r){this.gl.enable(this.gl.CULL_FACE),this.gl.useProgram(this.shaderProgram),this.gl.uniformMatrix4fv(this.shaderProgramLocations.pMatrixUniform,!1,r),this.gl.uniformMatrix4fv(this.shaderProgramLocations.mvMatrixUniform,!1,e),this.gl.enableVertexAttribArray(this.shaderProgramLocations.vertexPositionAttribute),this.gl.enableVertexAttribArray(this.shaderProgramLocations.textureCoordAttribute),this.gl.enableVertexAttribArray(this.shaderProgramLocations.colorAttribute);for(const n of this.emitters)n.particles.length&&(this.setLayerProps(n),this.setGeneralBuffers(n),n.type&De.Tail&&this.renderEmitterType(n,De.Tail),n.type&De.Head&&this.renderEmitterType(n,De.Head));this.gl.disableVertexAttribArray(this.shaderProgramLocations.vertexPositionAttribute),this.gl.disableVertexAttribArray(this.shaderProgramLocations.textureCoordAttribute),this.gl.disableVertexAttribArray(this.shaderProgramLocations.colorAttribute)}renderGPUEmitterType(e,r,n){n===De.Tail?(this.device.queue.writeBuffer(r.tailTexCoordGPUBuffer,0,r.tailTexCoords),e.setVertexBuffer(1,r.tailTexCoordGPUBuffer)):(this.device.queue.writeBuffer(r.headTexCoordGPUBuffer,0,r.headTexCoords),e.setVertexBuffer(1,r.headTexCoordGPUBuffer)),n===De.Tail?(this.device.queue.writeBuffer(r.tailVertexGPUBuffer,0,r.tailVertices),e.setVertexBuffer(0,r.tailVertexGPUBuffer)):(this.device.queue.writeBuffer(r.headVertexGPUBuffer,0,r.headVertices),e.setVertexBuffer(0,r.headVertexGPUBuffer)),e.drawIndexed(r.particles.length*6)}renderGPU(e,r,n){const i=new ArrayBuffer(128),o={mvMatrix:new Float32Array(i,0,16),pMatrix:new Float32Array(i,64,16)};o.mvMatrix.set(r),o.pMatrix.set(n),this.device.queue.writeBuffer(this.gpuVSUniformsBuffer,0,i),e.setBindGroup(0,this.gpuVSUniformsBindGroup);for(const s of this.emitters){if(!s.particles.length)continue;const a=this.gpuPipelines[s.props.FilterMode]||this.gpuPipelines[0];e.setPipeline(a);const c=s.props.TextureID,u=this.rendererData.model.Textures[c],l=new ArrayBuffer(32),d={replaceableColor:new Float32Array(l,0,3),replaceableType:new Uint32Array(l,12,1),discardAlphaLevel:new Float32Array(l,16,1)};d.replaceableColor.set(this.rendererData.teamColor),d.replaceableType.set([u.ReplaceableId||0]),s.props.FilterMode===vt.AlphaKey?d.discardAlphaLevel.set([As]):s.props.FilterMode===vt.Modulate||s.props.FilterMode===vt.Modulate2x?d.discardAlphaLevel.set([Ms]):d.discardAlphaLevel.set([0]),s.fsUniformsBuffer||(s.fsUniformsBuffer=this.device.createBuffer({label:`particles fs uniforms ${s.index}`,size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})),this.device.queue.writeBuffer(s.fsUniformsBuffer,0,l);const g=this.device.createBindGroup({label:`particles fs uniforms ${s.index}`,layout:this.fsBindGroupLayout,entries:[{binding:0,resource:{buffer:s.fsUniformsBuffer}},{binding:1,resource:this.rendererData.gpuSamplers[c]},{binding:2,resource:(this.rendererData.gpuTextures[u.Image]||this.rendererData.gpuEmptyTexture).createView()}]});e.setBindGroup(1,g),this.device.queue.writeBuffer(s.colorGPUBuffer,0,s.colors),this.device.queue.writeBuffer(s.indexGPUBuffer,0,s.indices),e.setVertexBuffer(2,s.colorGPUBuffer),e.setIndexBuffer(s.indexGPUBuffer,"uint16"),s.type&De.Tail&&this.renderGPUEmitterType(e,s,De.Tail),s.type&De.Head&&this.renderGPUEmitterType(e,s,De.Head)}}updateEmitter(e,r){if(this.interp.animVectorVal(e.props.Visibility,1)>0){if(e.props.Squirt&&typeof e.props.EmissionRate!="number"){const i=this.interp.findKeyframes(e.props.EmissionRate);i&&i.left&&i.left.Frame!==e.squirtFrame&&(e.squirtFrame=i.left.Frame,i.left.Vector[0]>0&&(e.emission+=i.left.Vector[0]*1e3))}else{const i=this.interp.animVectorVal(e.props.EmissionRate,0);e.emission+=i*r}for(;e.emission>=1e3;)e.emission-=1e3,e.particles.push(this.createParticle(e,this.rendererData.nodes[e.props.ObjectId].matrix))}if(e.particles.length){const i=[];for(const o of e.particles)this.updateParticle(o,r),o.lifeSpan>0?i.push(o):this.particleStorage.push(o);if(e.particles=i,e.type&De.Head)if(e.props.Flags&Mn.XYQuad)dt(this.particleBaseVectors[0],-1,1,0),dt(this.particleBaseVectors[1],-1,-1,0),dt(this.particleBaseVectors[2],1,1,0),dt(this.particleBaseVectors[3],1,-1,0);else{dt(this.particleBaseVectors[0],0,-1,1),dt(this.particleBaseVectors[1],0,-1,-1),dt(this.particleBaseVectors[2],0,1,1),dt(this.particleBaseVectors[3],0,1,-1);for(let o=0;o<4;++o)cl(this.particleBaseVectors[o],this.particleBaseVectors[o],this.rendererData.cameraQuat)}this.resizeEmitterBuffers(e,e.particles.length);for(let o=0;o<e.particles.length;++o)this.updateParticleBuffers(e.particles[o],o,e)}}createParticle(e,r){let n;this.particleStorage.length?n=this.particleStorage.pop():n={emitter:null,pos:He(),angle:0,speed:He(),gravity:null,lifeSpan:null};const i=this.interp.animVectorVal(e.props.Width,0),o=this.interp.animVectorVal(e.props.Length,0);let s=this.interp.animVectorVal(e.props.Speed,0);const a=this.interp.animVectorVal(e.props.Variation,0),c=Id(this.interp.animVectorVal(e.props.Latitude,0));return n.emitter=e,n.pos[0]=e.props.PivotPoint[0]+Hr(-i,i),n.pos[1]=e.props.PivotPoint[1]+Hr(-o,o),n.pos[2]=e.props.PivotPoint[2],yt(n.pos,n.pos,r),a>0&&(s*=1+Hr(-a,a)),dt(n.speed,0,0,s),n.angle=Hr(0,Math.PI*2),$f(n.speed,n.speed,Es,Hr(0,c)),Vf(n.speed,n.speed,Es,n.angle),e.props.Flags&Mn.LineEmitter&&(n.speed[0]=0),yt(n.speed,n.speed,r),n.speed[0]-=r[12],n.speed[1]-=r[13],n.speed[2]-=r[14],n.gravity=this.interp.animVectorVal(e.props.Gravity,0),n.lifeSpan=e.props.LifeSpan,n}updateParticleBuffers(e,r,n){const i=1-e.lifeSpan/n.props.LifeSpan,o=i<n.props.Time;let s;o?s=i/n.props.Time:s=(i-n.props.Time)/(1-n.props.Time),this.updateParticleVertices(e,r,n,o,s),this.updateParticleTexCoords(r,n,o,s),this.updateParticleColor(r,n,o,s)}updateParticleVertices(e,r,n,i,o){let s,a,c;if(i?(s=n.props.ParticleScaling[0],a=n.props.ParticleScaling[1]):(s=n.props.ParticleScaling[1],a=n.props.ParticleScaling[2]),c=qi(s,a,o),n.type&De.Head){for(let u=0;u<4;++u)if(n.headVertices[r*12+u*3]=this.particleBaseVectors[u][0]*c,n.headVertices[r*12+u*3+1]=this.particleBaseVectors[u][1]*c,n.headVertices[r*12+u*3+2]=this.particleBaseVectors[u][2]*c,n.props.Flags&Mn.XYQuad){const l=n.headVertices[r*12+u*3],d=n.headVertices[r*12+u*3+1];n.headVertices[r*12+u*3]=l*Math.cos(e.angle)-d*Math.sin(e.angle),n.headVertices[r*12+u*3+1]=l*Math.sin(e.angle)+d*Math.cos(e.angle)}}n.type&De.Tail&&(Ht[0]=-e.speed[0]*n.props.TailLength,Ht[1]=-e.speed[1]*n.props.TailLength,Ht[2]=-e.speed[2]*n.props.TailLength,Rr(et,e.speed,this.rendererData.cameraPos),to(et,et),ll(et,et,c),n.tailVertices[r*12]=et[0],n.tailVertices[r*12+1]=et[1],n.tailVertices[r*12+2]=et[2],n.tailVertices[r*12+3]=-et[0],n.tailVertices[r*12+3+1]=-et[1],n.tailVertices[r*12+3+2]=-et[2],n.tailVertices[r*12+6]=et[0]+Ht[0],n.tailVertices[r*12+6+1]=et[1]+Ht[1],n.tailVertices[r*12+6+2]=et[2]+Ht[2],n.tailVertices[r*12+9]=-et[0]+Ht[0],n.tailVertices[r*12+9+1]=-et[1]+Ht[1],n.tailVertices[r*12+9+2]=-et[2]+Ht[2]);for(let u=0;u<4;++u)n.headVertices&&(n.headVertices[r*12+u*3]+=e.pos[0],n.headVertices[r*12+u*3+1]+=e.pos[1],n.headVertices[r*12+u*3+2]+=e.pos[2]),n.tailVertices&&(n.tailVertices[r*12+u*3]+=e.pos[0],n.tailVertices[r*12+u*3+1]+=e.pos[1],n.tailVertices[r*12+u*3+2]+=e.pos[2])}updateParticleTexCoords(e,r,n,i){r.type&De.Head&&this.updateParticleTexCoordsByType(e,r,n,i,De.Head),r.type&De.Tail&&this.updateParticleTexCoordsByType(e,r,n,i,De.Tail)}updateParticleTexCoordsByType(e,r,n,i,o){let s,a;o===De.Tail?(s=n?r.props.TailUVAnim:r.props.TailDecayUVAnim,a=r.tailTexCoords):(s=n?r.props.LifeSpanUVAnim:r.props.DecayUVAnim,a=r.headTexCoords);const c=s[0],u=s[1],l=Math.round(qi(c,u,i)),d=l%r.props.Columns,g=Math.floor(l/r.props.Rows),f=1/r.props.Columns,h=1/r.props.Rows;a[e*8]=d*f,a[e*8+1]=g*h,a[e*8+2]=d*f,a[e*8+3]=(1+g)*h,a[e*8+4]=(1+d)*f,a[e*8+5]=g*h,a[e*8+6]=(1+d)*f,a[e*8+7]=(1+g)*h}updateParticleColor(e,r,n,i){n?(Nt[0]=r.props.SegmentColor[0][0],Nt[1]=r.props.SegmentColor[0][1],Nt[2]=r.props.SegmentColor[0][2],Nt[3]=r.props.Alpha[0]/255,Ot[0]=r.props.SegmentColor[1][0],Ot[1]=r.props.SegmentColor[1][1],Ot[2]=r.props.SegmentColor[1][2],Ot[3]=r.props.Alpha[1]/255):(Nt[0]=r.props.SegmentColor[1][0],Nt[1]=r.props.SegmentColor[1][1],Nt[2]=r.props.SegmentColor[1][2],Nt[3]=r.props.Alpha[1]/255,Ot[0]=r.props.SegmentColor[2][0],Ot[1]=r.props.SegmentColor[2][1],Ot[2]=r.props.SegmentColor[2][2],Ot[3]=r.props.Alpha[2]/255),Of(Xr,Nt,Ot,i);for(let o=0;o<4;++o)r.colors[e*16+o*4]=Xr[0],r.colors[e*16+o*4+1]=Xr[1],r.colors[e*16+o*4+2]=Xr[2],r.colors[e*16+o*4+3]=Xr[3]}setLayerProps(e){e.props.FilterMode===vt.AlphaKey?this.gl.uniform1f(this.shaderProgramLocations.discardAlphaLevelUniform,As):e.props.FilterMode===vt.Modulate||e.props.FilterMode===vt.Modulate2x?this.gl.uniform1f(this.shaderProgramLocations.discardAlphaLevelUniform,Ms):this.gl.uniform1f(this.shaderProgramLocations.discardAlphaLevelUniform,0),e.props.FilterMode===vt.Blend?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA,this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA),this.gl.depthMask(!1)):e.props.FilterMode===vt.Additive?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE),this.gl.depthMask(!1)):e.props.FilterMode===vt.AlphaKey?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE),this.gl.depthMask(!1)):e.props.FilterMode===vt.Modulate?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.ZERO,this.gl.SRC_COLOR,this.gl.ZERO,this.gl.ONE),this.gl.depthMask(!1)):e.props.FilterMode===vt.Modulate2x&&(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.DST_COLOR,this.gl.SRC_COLOR,this.gl.ZERO,this.gl.ONE),this.gl.depthMask(!1));const r=this.rendererData.model.Textures[e.props.TextureID];r.Image?(this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[r.Image]),this.gl.uniform1i(this.shaderProgramLocations.samplerUniform,0),this.gl.uniform1f(this.shaderProgramLocations.replaceableTypeUniform,0)):(r.ReplaceableId===1||r.ReplaceableId===2)&&(this.gl.uniform3fv(this.shaderProgramLocations.replaceableColorUniform,this.rendererData.teamColor),this.gl.uniform1f(this.shaderProgramLocations.replaceableTypeUniform,r.ReplaceableId))}setGeneralBuffers(e){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.colorBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e.colors,this.gl.DYNAMIC_DRAW),this.gl.vertexAttribPointer(this.shaderProgramLocations.colorAttribute,4,this.gl.FLOAT,!1,0,0),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,e.indexBuffer),this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,e.indices,this.gl.DYNAMIC_DRAW)}renderEmitterType(e,r){r===De.Tail?(this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.tailTexCoordBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e.tailTexCoords,this.gl.DYNAMIC_DRAW)):(this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.headTexCoordBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e.headTexCoords,this.gl.DYNAMIC_DRAW)),this.gl.vertexAttribPointer(this.shaderProgramLocations.textureCoordAttribute,2,this.gl.FLOAT,!1,0,0),r===De.Tail?(this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.tailVertexBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e.tailVertices,this.gl.DYNAMIC_DRAW)):(this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.headVertexBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e.headVertices,this.gl.DYNAMIC_DRAW)),this.gl.vertexAttribPointer(this.shaderProgramLocations.vertexPositionAttribute,3,this.gl.FLOAT,!1,0,0),this.gl.drawElements(this.gl.TRIANGLES,e.particles.length*6,this.gl.UNSIGNED_SHORT,0)}}const sh=`attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;

void main(void) {
    vec4 position = vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uMVMatrix * position;
    vTextureCoord = aTextureCoord;
}
`,ah=`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec3 uReplaceableColor;
uniform float uReplaceableType;
uniform float uDiscardAlphaLevel;
uniform vec4 uColor;

float hypot (vec2 z) {
    float t;
    float x = abs(z.x);
    float y = abs(z.y);
    t = min(x, y);
    x = max(x, y);
    t = t / x;
    return (z.x == 0.0 && z.y == 0.0) ? 0.0 : x * sqrt(1.0 + t * t);
}

void main(void) {
    vec2 coords = vec2(vTextureCoord.s, vTextureCoord.t);
    if (uReplaceableType == 0.) {
        gl_FragColor = texture2D(uSampler, coords);
    } else if (uReplaceableType == 1.) {
        gl_FragColor = vec4(uReplaceableColor, 1.0);
    } else if (uReplaceableType == 2.) {
        float dist = hypot(coords - vec2(0.5, 0.5)) * 2.;
        float truncateDist = clamp(1. - dist * 1.4, 0., 1.);
        float alpha = sin(truncateDist);
        gl_FragColor = vec4(uReplaceableColor * alpha, 1.0);
    }
    gl_FragColor *= uColor;

    if (gl_FragColor[3] < uDiscardAlphaLevel) {
        discard;
    }
}
`,lh=`struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
}

struct FSUniforms {
    replaceableColor: vec3f,
    replaceableType: u32,
    discardAlphaLevel: f32,
    color: vec4f,
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(1) @binding(0) var<uniform> fsUniforms: FSUniforms;
@group(1) @binding(1) var fsUniformSampler: sampler;
@group(1) @binding(2) var fsUniformTexture: texture_2d<f32>;

struct VSIn {
    @location(0) vertexPosition: vec3f,
    @location(1) textureCoord: vec2f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) textureCoord: vec2f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var position: vec4f = vec4f(in.vertexPosition, 1.0);

    var out: VSOut;
    out.position = vsUniforms.pMatrix * vsUniforms.mvMatrix * position;
    out.textureCoord = in.textureCoord;
    return out;
}

fn hypot(z: vec2f) -> f32 {
    var t: f32 = 0;
    var x: f32 = abs(z.x);
    let y: f32 = abs(z.y);
    t = min(x, y);
    x = max(x, y);
    t = t / x;
    if (z.x == 0.0 && z.y == 0.0) {
        return 0.0;
    }
    return x * sqrt(1.0 + t * t);
}

@fragment fn fs(
    in: VSOut
) -> @location(0) vec4f {
    let texCoord: vec2f = in.textureCoord;
    var color: vec4f = vec4f(0.0);

    if (fsUniforms.replaceableType == 0) {
        color = textureSample(fsUniformTexture, fsUniformSampler, texCoord);
    } else if (fsUniforms.replaceableType == 1) {
        color = vec4f(fsUniforms.replaceableColor, 1.0);
    } else if (fsUniforms.replaceableType == 2) {
        let dist: f32 = hypot(texCoord - vec2(0.5, 0.5)) * 2.;
        let truncateDist: f32 = clamp(1. - dist * 1.4, 0., 1.);
        let alpha: f32 = sin(truncateDist);
        color = vec4f(fsUniforms.replaceableColor * alpha, 1.0);
    }

    color *= fsUniforms.color;

    // hand-made alpha-test
    if (color.a < fsUniforms.discardAlphaLevel) {
        discard;
    }

    return color;
}
`;class ch{constructor(e,r){if(this.shaderProgramLocations={vertexPositionAttribute:null,textureCoordAttribute:null,pMatrixUniform:null,mvMatrixUniform:null,samplerUniform:null,replaceableColorUniform:null,replaceableTypeUniform:null,discardAlphaLevelUniform:null,colorUniform:null},this.interp=e,this.rendererData=r,this.emitters=[],r.model.RibbonEmitters.length)for(let n=0;n<r.model.RibbonEmitters.length;++n){const i=r.model.RibbonEmitters[n],o={index:n,emission:0,props:i,capacity:0,baseCapacity:0,creationTimes:[],vertices:null,vertexBuffer:null,vertexGPUBuffer:null,texCoords:null,texCoordBuffer:null,texCoordGPUBuffer:null,fsUnifrmsPerLayer:[]};o.baseCapacity=Math.ceil(ro.maxAnimVectorVal(o.props.EmissionRate)*o.props.LifeSpan)+1,this.emitters.push(o)}}destroy(){this.shaderProgram&&(this.vertexShader&&(this.gl.detachShader(this.shaderProgram,this.vertexShader),this.gl.deleteShader(this.vertexShader),this.vertexShader=null),this.fragmentShader&&(this.gl.detachShader(this.shaderProgram,this.fragmentShader),this.gl.deleteShader(this.fragmentShader),this.fragmentShader=null),this.gl.deleteProgram(this.shaderProgram),this.shaderProgram=null),this.gpuVSUniformsBuffer&&(this.gpuVSUniformsBuffer.destroy(),this.gpuVSUniformsBuffer=null);for(const e of this.emitters)for(const r of e.fsUnifrmsPerLayer)r.destroy();this.emitters=[]}initGL(e){this.gl=e,this.initShaders()}initGPUDevice(e){this.device=e,this.gpuShaderModule=e.createShaderModule({label:"ribbons shader module",code:lh}),this.vsBindGroupLayout=this.device.createBindGroupLayout({label:"ribbons vs bind group layout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform",hasDynamicOffset:!1,minBindingSize:128}}]}),this.fsBindGroupLayout=this.device.createBindGroupLayout({label:"ribbons bind group layout2",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform",hasDynamicOffset:!1,minBindingSize:48}},{binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}}]}),this.gpuPipelineLayout=this.device.createPipelineLayout({label:"ribbons pipeline layout",bindGroupLayouts:[this.vsBindGroupLayout,this.fsBindGroupLayout]});const r=(n,i,o)=>e.createRenderPipeline({label:`ribbons pipeline ${n}`,layout:this.gpuPipelineLayout,vertex:{module:this.gpuShaderModule,buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]},{arrayStride:8,attributes:[{shaderLocation:1,offset:0,format:"float32x2"}]}]},fragment:{module:this.gpuShaderModule,targets:[{format:navigator.gpu.getPreferredCanvasFormat(),blend:i}]},depthStencil:o,primitive:{topology:"triangle-strip"}});this.gpuPipelines=[r("none",{color:{operation:"add",srcFactor:"one",dstFactor:"zero"},alpha:{operation:"add",srcFactor:"one",dstFactor:"zero"}},{depthWriteEnabled:!0,depthCompare:"less-equal",format:"depth24plus"}),r("transparent",{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"},alpha:{operation:"add",srcFactor:"one",dstFactor:"one-minus-src-alpha"}},{depthWriteEnabled:!0,depthCompare:"less-equal",format:"depth24plus"}),r("blend",{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"},alpha:{operation:"add",srcFactor:"one",dstFactor:"one-minus-src-alpha"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}),r("additive",{color:{operation:"add",srcFactor:"src",dstFactor:"one"},alpha:{operation:"add",srcFactor:"src",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}),r("addAlpha",{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one"},alpha:{operation:"add",srcFactor:"src-alpha",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}),r("modulate",{color:{operation:"add",srcFactor:"zero",dstFactor:"src"},alpha:{operation:"add",srcFactor:"zero",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}),r("modulate2x",{color:{operation:"add",srcFactor:"dst",dstFactor:"src"},alpha:{operation:"add",srcFactor:"zero",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"})],this.gpuVSUniformsBuffer=this.device.createBuffer({label:"ribbons vs uniforms",size:128,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.gpuVSUniformsBindGroup=this.device.createBindGroup({layout:this.vsBindGroupLayout,entries:[{binding:0,resource:{buffer:this.gpuVSUniformsBuffer}}]})}update(e){for(const r of this.emitters)this.updateEmitter(r,e)}render(e,r){this.gl.useProgram(this.shaderProgram),this.gl.uniformMatrix4fv(this.shaderProgramLocations.pMatrixUniform,!1,r),this.gl.uniformMatrix4fv(this.shaderProgramLocations.mvMatrixUniform,!1,e),this.gl.enableVertexAttribArray(this.shaderProgramLocations.vertexPositionAttribute),this.gl.enableVertexAttribArray(this.shaderProgramLocations.textureCoordAttribute);for(const n of this.emitters){if(n.creationTimes.length<2)continue;this.gl.uniform4f(this.shaderProgramLocations.colorUniform,n.props.Color[0],n.props.Color[1],n.props.Color[2],this.interp.animVectorVal(n.props.Alpha,1)),this.setGeneralBuffers(n);const i=n.props.MaterialID,o=this.rendererData.model.Materials[i];for(let s=0;s<o.Layers.length;++s)this.setLayerProps(o.Layers[s],this.rendererData.materialLayerTextureID[i][s]),this.renderEmitter(n)}this.gl.disableVertexAttribArray(this.shaderProgramLocations.vertexPositionAttribute),this.gl.disableVertexAttribArray(this.shaderProgramLocations.textureCoordAttribute)}renderGPU(e,r,n){const i=new ArrayBuffer(128),o={mvMatrix:new Float32Array(i,0,16),pMatrix:new Float32Array(i,64,16)};o.mvMatrix.set(r),o.pMatrix.set(n),this.device.queue.writeBuffer(this.gpuVSUniformsBuffer,0,i);for(const s of this.emitters){if(s.creationTimes.length<2)continue;this.device.queue.writeBuffer(s.vertexGPUBuffer,0,s.vertices),this.device.queue.writeBuffer(s.texCoordGPUBuffer,0,s.texCoords),e.setVertexBuffer(0,s.vertexGPUBuffer),e.setVertexBuffer(1,s.texCoordGPUBuffer),e.setBindGroup(0,this.gpuVSUniformsBindGroup);const a=s.props.MaterialID,c=this.rendererData.model.Materials[a];for(let u=0;u<c.Layers.length;++u){const l=this.rendererData.materialLayerTextureID[a][u],d=this.rendererData.model.Textures[l],g=c.Layers[u],f=this.gpuPipelines[g.FilterMode]||this.gpuPipelines[0];e.setPipeline(f);const h=new ArrayBuffer(48),v={replaceableColor:new Float32Array(h,0,3),replaceableType:new Uint32Array(h,12,1),discardAlphaLevel:new Float32Array(h,16,1),color:new Float32Array(h,32,4)};v.replaceableColor.set(this.rendererData.teamColor),v.replaceableType.set([d.ReplaceableId||0]),v.discardAlphaLevel.set([g.FilterMode===Re.Transparent?.75:0]),v.color.set([s.props.Color[0],s.props.Color[1],s.props.Color[2],this.interp.animVectorVal(s.props.Alpha,1)]),s.fsUnifrmsPerLayer[u]||(s.fsUnifrmsPerLayer[u]=this.device.createBuffer({label:`ribbons fs uniforms ${s.index} layer ${u}`,size:48,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}));const S=s.fsUnifrmsPerLayer[u];this.device.queue.writeBuffer(S,0,h);const p=this.device.createBindGroup({label:`ribbons fs uniforms ${s.index}`,layout:this.fsBindGroupLayout,entries:[{binding:0,resource:{buffer:S}},{binding:1,resource:this.rendererData.gpuSamplers[l]},{binding:2,resource:(this.rendererData.gpuTextures[d.Image]||this.rendererData.gpuEmptyTexture).createView()}]});e.setBindGroup(1,p),e.draw(s.creationTimes.length*2)}}}initShaders(){const e=this.vertexShader=$t(this.gl,sh,this.gl.VERTEX_SHADER),r=this.fragmentShader=$t(this.gl,ah,this.gl.FRAGMENT_SHADER),n=this.shaderProgram=this.gl.createProgram();this.gl.attachShader(n,e),this.gl.attachShader(n,r),this.gl.linkProgram(n),this.gl.getProgramParameter(n,this.gl.LINK_STATUS)||alert("Could not initialise shaders"),this.gl.useProgram(n),this.shaderProgramLocations.vertexPositionAttribute=this.gl.getAttribLocation(n,"aVertexPosition"),this.shaderProgramLocations.textureCoordAttribute=this.gl.getAttribLocation(n,"aTextureCoord"),this.shaderProgramLocations.pMatrixUniform=this.gl.getUniformLocation(n,"uPMatrix"),this.shaderProgramLocations.mvMatrixUniform=this.gl.getUniformLocation(n,"uMVMatrix"),this.shaderProgramLocations.samplerUniform=this.gl.getUniformLocation(n,"uSampler"),this.shaderProgramLocations.replaceableColorUniform=this.gl.getUniformLocation(n,"uReplaceableColor"),this.shaderProgramLocations.replaceableTypeUniform=this.gl.getUniformLocation(n,"uReplaceableType"),this.shaderProgramLocations.discardAlphaLevelUniform=this.gl.getUniformLocation(n,"uDiscardAlphaLevel"),this.shaderProgramLocations.colorUniform=this.gl.getUniformLocation(n,"uColor")}resizeEmitterBuffers(e,r){var n,i;if(r<=e.capacity)return;r=Math.min(r,e.baseCapacity);const o=new Float32Array(r*2*3),s=new Float32Array(r*2*2);e.vertices&&o.set(e.vertices),e.vertices=o,e.texCoords=s,e.capacity=r,this.gl?e.vertexBuffer||(e.vertexBuffer=this.gl.createBuffer(),e.texCoordBuffer=this.gl.createBuffer()):this.device&&((n=e.vertexGPUBuffer)==null||n.destroy(),(i=e.texCoordGPUBuffer)==null||i.destroy(),e.vertexGPUBuffer=this.device.createBuffer({label:`ribbon vertex buffer ${e.index}`,size:o.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),e.texCoordGPUBuffer=this.device.createBuffer({label:`ribbon texCoord buffer ${e.index}`,size:s.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}))}updateEmitter(e,r){const n=Date.now();if(this.interp.animVectorVal(e.props.Visibility,0)>0){const o=e.props.EmissionRate;e.emission+=o*r,e.emission>=1e3&&(e.emission=e.emission%1e3,e.creationTimes.length+1>e.capacity&&this.resizeEmitterBuffers(e,e.creationTimes.length+1),this.appendVertices(e),e.creationTimes.push(n))}if(e.creationTimes.length)for(;e.creationTimes[0]+e.props.LifeSpan*1e3<n;){e.creationTimes.shift();for(let o=0;o+6+5<e.vertices.length;o+=6)e.vertices[o]=e.vertices[o+6],e.vertices[o+1]=e.vertices[o+7],e.vertices[o+2]=e.vertices[o+8],e.vertices[o+3]=e.vertices[o+9],e.vertices[o+4]=e.vertices[o+10],e.vertices[o+5]=e.vertices[o+11]}e.creationTimes.length&&this.updateEmitterTexCoords(e,n)}appendVertices(e){const r=Us(e.props.PivotPoint),n=Us(e.props.PivotPoint);r[1]-=this.interp.animVectorVal(e.props.HeightBelow,0),n[1]+=this.interp.animVectorVal(e.props.HeightAbove,0);const i=this.rendererData.nodes[e.props.ObjectId].matrix;yt(r,r,i),yt(n,n,i);const o=e.creationTimes.length;e.vertices[o*6]=r[0],e.vertices[o*6+1]=r[1],e.vertices[o*6+2]=r[2],e.vertices[o*6+3]=n[0],e.vertices[o*6+4]=n[1],e.vertices[o*6+5]=n[2]}updateEmitterTexCoords(e,r){for(let n=0;n<e.creationTimes.length;++n){let i=(r-e.creationTimes[n])/(e.props.LifeSpan*1e3);const o=this.interp.animVectorVal(e.props.TextureSlot,0),s=o%e.props.Columns,a=Math.floor(o/e.props.Rows),c=1/e.props.Columns,u=1/e.props.Rows;i=s*c+i*c,e.texCoords[n*2*2]=i,e.texCoords[n*2*2+1]=a*u,e.texCoords[n*2*2+2]=i,e.texCoords[n*2*2+3]=(1+a)*u}}setLayerProps(e,r){const n=this.rendererData.model.Textures[r];e.Shading&Tt.TwoSided?this.gl.disable(this.gl.CULL_FACE):this.gl.enable(this.gl.CULL_FACE),e.FilterMode===Re.Transparent?this.gl.uniform1f(this.shaderProgramLocations.discardAlphaLevelUniform,.75):this.gl.uniform1f(this.shaderProgramLocations.discardAlphaLevelUniform,0),e.FilterMode===Re.None?(this.gl.disable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.depthMask(!0)):e.FilterMode===Re.Transparent?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA,this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA),this.gl.depthMask(!0)):e.FilterMode===Re.Blend?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA,this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA),this.gl.depthMask(!1)):e.FilterMode===Re.Additive?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFunc(this.gl.SRC_COLOR,this.gl.ONE),this.gl.depthMask(!1)):e.FilterMode===Re.AddAlpha?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE),this.gl.depthMask(!1)):e.FilterMode===Re.Modulate?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.ZERO,this.gl.SRC_COLOR,this.gl.ZERO,this.gl.ONE),this.gl.depthMask(!1)):e.FilterMode===Re.Modulate2x&&(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.DST_COLOR,this.gl.SRC_COLOR,this.gl.ZERO,this.gl.ONE),this.gl.depthMask(!1)),n.Image?(this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[n.Image]),this.gl.uniform1i(this.shaderProgramLocations.samplerUniform,0),this.gl.uniform1f(this.shaderProgramLocations.replaceableTypeUniform,0)):(n.ReplaceableId===1||n.ReplaceableId===2)&&(this.gl.uniform3fv(this.shaderProgramLocations.replaceableColorUniform,this.rendererData.teamColor),this.gl.uniform1f(this.shaderProgramLocations.replaceableTypeUniform,n.ReplaceableId)),e.Shading&Tt.NoDepthTest&&this.gl.disable(this.gl.DEPTH_TEST),e.Shading&Tt.NoDepthSet&&this.gl.depthMask(!1)}setGeneralBuffers(e){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.texCoordBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e.texCoords,this.gl.DYNAMIC_DRAW),this.gl.vertexAttribPointer(this.shaderProgramLocations.textureCoordAttribute,2,this.gl.FLOAT,!1,0,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.vertexBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e.vertices,this.gl.DYNAMIC_DRAW),this.gl.vertexAttribPointer(this.shaderProgramLocations.vertexPositionAttribute,3,this.gl.FLOAT,!1,0,0)}renderEmitter(e){this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,e.creationTimes.length*2)}}const uh=`attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;
attribute vec4 aGroup;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNodesMatrices[\${MAX_NODES}];

varying vec3 vNormal;
varying vec2 vTextureCoord;

void main(void) {
    vec4 position = vec4(aVertexPosition, 1.0);
    int count = 1;
    vec4 sum = uNodesMatrices[int(aGroup[0])] * position;

    if (aGroup[1] < \${MAX_NODES}.) {
        sum += uNodesMatrices[int(aGroup[1])] * position;
        count += 1;
    }
    if (aGroup[2] < \${MAX_NODES}.) {
        sum += uNodesMatrices[int(aGroup[2])] * position;
        count += 1;
    }
    if (aGroup[3] < \${MAX_NODES}.) {
        sum += uNodesMatrices[int(aGroup[3])] * position;
        count += 1;
    }
    sum.xyz /= float(count);
    sum.w = 1.;
    position = sum;

    gl_Position = uPMatrix * uMVMatrix * position;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}`,dh=`attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 vNormal;
varying vec2 vTextureCoord;

void main(void) {
    vec4 position = vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uMVMatrix * position;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}`,fh=`precision mediump float;

varying vec3 vNormal;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec3 uReplaceableColor;
uniform float uReplaceableType;
uniform float uDiscardAlphaLevel;
uniform mat3 uTVertexAnim;
uniform float uWireframe;

float hypot (vec2 z) {
    float t;
    float x = abs(z.x);
    float y = abs(z.y);
    t = min(x, y);
    x = max(x, y);
    t = t / x;
    return (z.x == 0.0 && z.y == 0.0) ? 0.0 : x * sqrt(1.0 + t * t);
}

void main(void) {
    if (uWireframe > 0.) {
        gl_FragColor = vec4(1.);
        return;
    }

    vec2 texCoord = (uTVertexAnim * vec3(vTextureCoord.s, vTextureCoord.t, 1.)).st;

    if (uReplaceableType == 0.) {
        gl_FragColor = texture2D(uSampler, texCoord);
    } else if (uReplaceableType == 1.) {
        gl_FragColor = vec4(uReplaceableColor, 1.0);
    } else if (uReplaceableType == 2.) {
        float dist = hypot(texCoord - vec2(0.5, 0.5)) * 2.;
        float truncateDist = clamp(1. - dist * 1.4, 0., 1.);
        float alpha = sin(truncateDist);
        gl_FragColor = vec4(uReplaceableColor * alpha, 1.0);
    }

    // hand-made alpha-test
    if (gl_FragColor[3] < uDiscardAlphaLevel) {
        discard;
    }
}
`,hh=`attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;
attribute vec4 aSkin;
attribute vec4 aBoneWeight;
attribute vec4 aTangent;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNodesMatrices[\${MAX_NODES}];

varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec2 vTextureCoord;
varying mat3 vTBN;
varying vec3 vFragPos;

void main(void) {
    vec4 position = vec4(aVertexPosition, 1.0);
    mat4 sum;

    // sum += uNodesMatrices[int(aSkin[0])] * 1.;
    sum += uNodesMatrices[int(aSkin[0])] * aBoneWeight[0];
    sum += uNodesMatrices[int(aSkin[1])] * aBoneWeight[1];
    sum += uNodesMatrices[int(aSkin[2])] * aBoneWeight[2];
    sum += uNodesMatrices[int(aSkin[3])] * aBoneWeight[3];

    mat3 rotation = mat3(sum);

    position = sum * position;
    position.w = 1.;

    gl_Position = uPMatrix * uMVMatrix * position;
    vTextureCoord = aTextureCoord;

    vec3 normal = aNormal;
    vec3 tangent = aTangent.xyz;

    // https://learnopengl.com/Advanced-Lighting/Normal-Mapping
    tangent = normalize(tangent - dot(tangent, normal) * normal);

    vec3 binormal = cross(normal, tangent) * aTangent.w;

    normal = normalize(rotation * normal);
    tangent = normalize(rotation * tangent);
    binormal = normalize(rotation * binormal);

    vNormal = normal;
    vTangent = tangent;
    vBinormal = binormal;

    vTBN = mat3(tangent, binormal, normal);

    vFragPos = position.xyz;
}`,gh=`#version 300 es
in vec3 aVertexPosition;
in vec3 aNormal;
in vec2 aTextureCoord;
in vec4 aSkin;
in vec4 aBoneWeight;
in vec4 aTangent;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNodesMatrices[\${MAX_NODES}];

out vec3 vNormal;
out vec3 vTangent;
out vec3 vBinormal;
out vec2 vTextureCoord;
out mat3 vTBN;
out vec3 vFragPos;

void main(void) {
    vec4 position = vec4(aVertexPosition, 1.0);
    mat4 sum;

    // sum += uNodesMatrices[int(aSkin[0])] * 1.;
    sum += uNodesMatrices[int(aSkin[0])] * aBoneWeight[0];
    sum += uNodesMatrices[int(aSkin[1])] * aBoneWeight[1];
    sum += uNodesMatrices[int(aSkin[2])] * aBoneWeight[2];
    sum += uNodesMatrices[int(aSkin[3])] * aBoneWeight[3];

    mat3 rotation = mat3(sum);

    position = sum * position;
    position.w = 1.;

    gl_Position = uPMatrix * uMVMatrix * position;
    vTextureCoord = aTextureCoord;

    vec3 normal = aNormal;
    vec3 tangent = aTangent.xyz;

    // https://learnopengl.com/Advanced-Lighting/Normal-Mapping
    tangent = normalize(tangent - dot(tangent, normal) * normal);

    vec3 binormal = cross(normal, tangent) * aTangent.w;

    normal = normalize(rotation * normal);
    tangent = normalize(rotation * tangent);
    binormal = normalize(rotation * binormal);

    vNormal = normal;
    vTangent = tangent;
    vBinormal = binormal;

    vTBN = mat3(tangent, binormal, normal);

    vFragPos = position.xyz;
}`,mh=`precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBinormal;
varying mat3 vTBN;
varying vec3 vFragPos;

uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;
uniform sampler2D uOrmSampler;
uniform vec3 uReplaceableColor;
uniform float uDiscardAlphaLevel;
uniform mat3 uTVertexAnim;
uniform vec3 uLightPos;
uniform vec3 uLightColor;
uniform vec3 uCameraPos;
uniform vec3 uShadowParams;
uniform sampler2D uShadowMapSampler;
uniform mat4 uShadowMapLightMatrix;
uniform float uWireframe;

const float PI = 3.14159265359;
const float gamma = 2.2;

float distributionGGX(vec3 normal, vec3 halfWay, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float nDotH = max(dot(normal, halfWay), 0.0);
    float nDotH2 = nDotH * nDotH;

    float num = a2;
    float denom = (nDotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num / denom;
}

float geometrySchlickGGX(float nDotV, float roughness) {
    float r = roughness + 1.;
    float k = r * r / 8.;
    // float k = roughness * roughness / 2.;

    float num = nDotV;
    float denom = nDotV * (1. - k) + k;

    return num / denom;
}

float geometrySmith(vec3 normal, vec3 viewDir, vec3 lightDir, float roughness) {
    float nDotV = max(dot(normal, viewDir), .0);
    float nDotL = max(dot(normal, lightDir), .0);
    float ggx2  = geometrySchlickGGX(nDotV, roughness);
    float ggx1  = geometrySchlickGGX(nDotL, roughness);

    return ggx1 * ggx2;
}

vec3 fresnelSchlick(float lightFactor, vec3 f0) {
    return f0 + (1. - f0) * pow(clamp(1. - lightFactor, 0., 1.), 5.);
}

void main(void) {
    if (uWireframe > 0.) {
        gl_FragColor = vec4(1.);
        return;
    }

    vec2 texCoord = (uTVertexAnim * vec3(vTextureCoord.s, vTextureCoord.t, 1.)).st;

    vec4 orm = texture2D(uOrmSampler, texCoord);

    float occlusion = orm.r;
    float roughness = orm.g;
    float metallic = orm.b;
    float teamColorFactor = orm.a;

    vec4 baseColor = texture2D(uSampler, texCoord);
    vec3 teamColor = baseColor.rgb * uReplaceableColor;
    baseColor.rgb = mix(baseColor.rgb, teamColor, teamColorFactor);
    baseColor.rgb = pow(baseColor.rgb, vec3(gamma));

    vec3 normal = texture2D(uNormalSampler, texCoord).rgb;
    normal = normal * 2.0 - 1.0;
    normal.x = -normal.x;
    normal.y = -normal.y;
    if (!gl_FrontFacing) {
        normal = -normal;
    }
    normal = normalize(vTBN * -normal);

    vec3 viewDir = normalize(uCameraPos - vFragPos);
    vec3 reflected = reflect(-viewDir, normal);

    vec3 lightDir = normalize(uLightPos - vFragPos);
    float lightFactor = max(dot(normal, lightDir), .0);
    vec3 radiance = uLightColor;

    vec3 f0 = vec3(.04);
    f0 = mix(f0, baseColor.rgb, metallic);

    vec3 totalLight = vec3(0.);
    vec3 halfWay = normalize(viewDir + lightDir);
    float ndf = distributionGGX(normal, halfWay, roughness);
    float g = geometrySmith(normal, viewDir, lightDir, roughness);
    vec3 f = fresnelSchlick(max(dot(halfWay, viewDir), 0.), f0);

    vec3 kS = f;
    // vec3 kD = vec3(1.) - kS;
    vec3 kD = vec3(1.);
    // kD *= 1.0 - metallic;
    vec3 num = ndf * g * f;
    float denom = 4. * max(dot(normal, viewDir), 0.) * max(dot(normal, lightDir), 0.) + .0001;
    vec3 specular = num / denom;

    totalLight = (kD * baseColor.rgb / PI + specular) * radiance * lightFactor;

    if (uShadowParams[0] > .5) {
        float shadowBias = uShadowParams[1];
        float shadowStep = uShadowParams[2];
        vec4 fragInLightPos = uShadowMapLightMatrix * vec4(vFragPos, 1.);
        vec3 shadowMapCoord = fragInLightPos.xyz / fragInLightPos.w;
        shadowMapCoord.xyz = (shadowMapCoord.xyz + 1.0) * .5;

        int passes = 5;
        float step = 1. / float(passes);

        float lightDepth = texture2D(uShadowMapSampler, shadowMapCoord.xy).r;
        float lightDepth0 = texture2D(uShadowMapSampler, vec2(shadowMapCoord.x + shadowStep, shadowMapCoord.y)).r;
        float lightDepth1 = texture2D(uShadowMapSampler, vec2(shadowMapCoord.x, shadowMapCoord.y + shadowStep)).r;
        float lightDepth2 = texture2D(uShadowMapSampler, vec2(shadowMapCoord.x, shadowMapCoord.y - shadowStep)).r;
        float lightDepth3 = texture2D(uShadowMapSampler, vec2(shadowMapCoord.x - shadowStep, shadowMapCoord.y)).r;
        float currentDepth = shadowMapCoord.z;

        float visibility = 0.;
        if (lightDepth > currentDepth - shadowBias) {
            visibility += step;
        }
        if (lightDepth0 > currentDepth - shadowBias) {
            visibility += step;
        }
        if (lightDepth1 > currentDepth - shadowBias) {
            visibility += step;
        }
        if (lightDepth2 > currentDepth - shadowBias) {
            visibility += step;
        }
        if (lightDepth3 > currentDepth - shadowBias) {
            visibility += step;
        }

        totalLight *= visibility;
    }

    vec3 color;

    vec3 ambient = vec3(.03);
    ambient *= baseColor.rgb * occlusion;
    color = ambient + totalLight;

    color = color / (vec3(1.) + color);
    color = pow(color, vec3(1. / gamma));

    gl_FragColor = vec4(color, 1.);

    // hand-made alpha-test
    if (gl_FragColor[3] < uDiscardAlphaLevel) {
        discard;
    }
}
`,ph=`#version 300 es
precision mediump float;

in vec2 vTextureCoord;
in vec3 vNormal;
in vec3 vTangent;
in vec3 vBinormal;
in mat3 vTBN;
in vec3 vFragPos;

out vec4 FragColor;

uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;
uniform sampler2D uOrmSampler;
uniform vec3 uReplaceableColor;
uniform float uDiscardAlphaLevel;
uniform mat3 uTVertexAnim;
uniform vec3 uLightPos;
uniform vec3 uLightColor;
uniform vec3 uCameraPos;
uniform vec3 uShadowParams;
uniform sampler2D uShadowMapSampler;
uniform mat4 uShadowMapLightMatrix;
uniform bool uHasEnv;
uniform samplerCube uIrradianceMap;
uniform samplerCube uPrefilteredEnv;
uniform sampler2D uBRDFLUT;
uniform float uWireframe;

const float PI = 3.14159265359;
const float gamma = 2.2;
const float MAX_REFLECTION_LOD = \${MAX_ENV_MIP_LEVELS};

float distributionGGX(vec3 normal, vec3 halfWay, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float nDotH = max(dot(normal, halfWay), 0.0);
    float nDotH2 = nDotH * nDotH;

    float num = a2;
    float denom = (nDotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num / denom;
}

float geometrySchlickGGX(float nDotV, float roughness) {
    float r = roughness + 1.;
    float k = r * r / 8.;
    // float k = roughness * roughness / 2.;

    float num = nDotV;
    float denom = nDotV * (1. - k) + k;

    return num / denom;
}

float geometrySmith(vec3 normal, vec3 viewDir, vec3 lightDir, float roughness) {
    float nDotV = max(dot(normal, viewDir), .0);
    float nDotL = max(dot(normal, lightDir), .0);
    float ggx2  = geometrySchlickGGX(nDotV, roughness);
    float ggx1  = geometrySchlickGGX(nDotL, roughness);

    return ggx1 * ggx2;
}

vec3 fresnelSchlick(float lightFactor, vec3 f0) {
    return f0 + (1. - f0) * pow(clamp(1. - lightFactor, 0., 1.), 5.);
}

vec3 fresnelSchlickRoughness(float lightFactor, vec3 f0, float roughness) {
    return f0 + (max(vec3(1.0 - roughness), f0) - f0) * pow(clamp(1.0 - lightFactor, 0.0, 1.0), 5.0);
}

void main(void) {
    if (uWireframe > 0.) {
        FragColor = vec4(1.);
        return;
    }

    vec2 texCoord = (uTVertexAnim * vec3(vTextureCoord.s, vTextureCoord.t, 1.)).st;

    vec4 orm = texture(uOrmSampler, texCoord);

    float occlusion = orm.r;
    float roughness = orm.g;
    float metallic = orm.b;
    float teamColorFactor = orm.a;

    vec4 baseColor = texture(uSampler, texCoord);
    vec3 teamColor = baseColor.rgb * uReplaceableColor;
    baseColor.rgb = mix(baseColor.rgb, teamColor, teamColorFactor);
    baseColor.rgb = pow(baseColor.rgb, vec3(gamma));

    vec3 normal = texture(uNormalSampler, texCoord).rgb;
    normal = normal * 2.0 - 1.0;
    normal.x = -normal.x;
    normal.y = -normal.y;
    if (!gl_FrontFacing) {
        normal = -normal;
    }
    normal = normalize(vTBN * -normal);

    vec3 viewDir = normalize(uCameraPos - vFragPos);
    vec3 reflected = reflect(-viewDir, normal);

    vec3 lightDir = normalize(uLightPos - vFragPos);
    float lightFactor = max(dot(normal, lightDir), .0);
    vec3 radiance = uLightColor;

    vec3 f0 = vec3(.04);
    f0 = mix(f0, baseColor.rgb, metallic);

    vec3 totalLight = vec3(0.);
    vec3 halfWay = normalize(viewDir + lightDir);
    float ndf = distributionGGX(normal, halfWay, roughness);
    float g = geometrySmith(normal, viewDir, lightDir, roughness);
    vec3 f = fresnelSchlick(max(dot(halfWay, viewDir), 0.), f0);

    vec3 kS = f;
    vec3 kD = vec3(1.);// - kS;
    if (uHasEnv) {
        kD *= 1.0 - metallic;
    }
    vec3 num = ndf * g * f;
    float denom = 4. * max(dot(normal, viewDir), 0.) * max(dot(normal, lightDir), 0.) + .0001;
    vec3 specular = num / denom;

    totalLight = (kD * baseColor.rgb / PI + specular) * radiance * lightFactor;

    if (uShadowParams[0] > .5) {
        float shadowBias = uShadowParams[1];
        float shadowStep = uShadowParams[2];
        vec4 fragInLightPos = uShadowMapLightMatrix * vec4(vFragPos, 1.);
        vec3 shadowMapCoord = fragInLightPos.xyz / fragInLightPos.w;
        shadowMapCoord.xyz = (shadowMapCoord.xyz + 1.0) * .5;

        int passes = 5;
        float step = 1. / float(passes);

        float lightDepth = texture(uShadowMapSampler, shadowMapCoord.xy).r;
        float lightDepth0 = texture(uShadowMapSampler, vec2(shadowMapCoord.x + shadowStep, shadowMapCoord.y)).r;
        float lightDepth1 = texture(uShadowMapSampler, vec2(shadowMapCoord.x, shadowMapCoord.y + shadowStep)).r;
        float lightDepth2 = texture(uShadowMapSampler, vec2(shadowMapCoord.x, shadowMapCoord.y - shadowStep)).r;
        float lightDepth3 = texture(uShadowMapSampler, vec2(shadowMapCoord.x - shadowStep, shadowMapCoord.y)).r;
        float currentDepth = shadowMapCoord.z;

        float visibility = 0.;
        if (lightDepth > currentDepth - shadowBias) {
            visibility += step;
        }
        if (lightDepth0 > currentDepth - shadowBias) {
            visibility += step;
        }
        if (lightDepth1 > currentDepth - shadowBias) {
            visibility += step;
        }
        if (lightDepth2 > currentDepth - shadowBias) {
            visibility += step;
        }
        if (lightDepth3 > currentDepth - shadowBias) {
            visibility += step;
        }

        totalLight *= visibility;
    }

    vec3 color;

    if (uHasEnv) {
        vec3 f = fresnelSchlickRoughness(max(dot(normal, viewDir), 0.0), f0, roughness);
        vec3 kS = f;
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - metallic;

        vec3 diffuse = texture(uIrradianceMap, normal).rgb * baseColor.rgb;
        vec3 prefilteredColor = textureLod(uPrefilteredEnv, reflected, roughness * MAX_REFLECTION_LOD).rgb;
        vec2 envBRDF = texture(uBRDFLUT, vec2(max(dot(normal, viewDir), 0.0), roughness)).rg;
        specular = prefilteredColor * (f * envBRDF.x + envBRDF.y);

        vec3 ambient = (kD * diffuse + specular) * occlusion;
        color = ambient + totalLight;
    } else {
        vec3 ambient = vec3(.03);
        ambient *= baseColor.rgb * occlusion;
        color = ambient + totalLight;
    }

    color = color / (vec3(1.) + color);
    color = pow(color, vec3(1. / gamma));

    FragColor = vec4(color, baseColor.a);

    // hand-made alpha-test
    if (FragColor[3] < uDiscardAlphaLevel) {
        discard;
    }
}
`,vh=`attribute vec3 aVertexPosition;
attribute vec3 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 vColor;

void main(void) {
    vec4 position = vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uMVMatrix * position;
    vColor = aColor;
}`,bh=`precision mediump float;

varying vec3 vColor;

void main(void) {
    gl_FragColor = vec4(vColor, 1.0);
}`,xh=`attribute vec3 aPos;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 vLocalPos;

void main(void) {
    vLocalPos = aPos;
    gl_Position = uPMatrix * uMVMatrix * vec4(aPos, 1.0);
}`,Sh=`precision mediump float;

varying vec3 vLocalPos;

uniform sampler2D uEquirectangularMap;

const vec2 invAtan = vec2(0.1591, 0.3183);

vec2 SampleSphericalMap(vec3 v) {
    // vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    vec2 uv = vec2(atan(v.x, v.y), asin(-v.z));
    uv *= invAtan;
    uv += 0.5;
    return uv;
}

void main(void) {
    vec2 uv = SampleSphericalMap(normalize(vLocalPos)); // make sure to normalize localPos
    vec3 color = texture2D(uEquirectangularMap, uv).rgb;

    gl_FragColor = vec4(color, 1.0);
}`,wh=`#version 300 es

in vec3 aPos;
out vec3 vLocalPos;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main(void) {
    vLocalPos = aPos;
    mat4 rotView = mat4(mat3(uMVMatrix)); // remove translation from the view matrix
    vec4 clipPos = uPMatrix * rotView * 1000. * vec4(aPos, 1.0);

    gl_Position = clipPos.xyww;
}`,Ph=`#version 300 es
precision mediump float;

in vec3 vLocalPos;

out vec4 FragColor;

uniform samplerCube uEnvironmentMap;

void main(void) {
    // vec3 envColor = textureLod(uEnvironmentMap, vLocalPos, 0.0).rgb;
    vec3 envColor = texture(uEnvironmentMap, vLocalPos).rgb;

    FragColor = vec4(envColor, 1.0);
}`,Th=`attribute vec3 aPos;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 vLocalPos;

void main(void) {
    vLocalPos = aPos;
    gl_Position = uPMatrix * uMVMatrix * vec4(aPos, 1.0);
}`,yh=`precision mediump float;

varying vec3 vLocalPos;

uniform samplerCube uEnvironmentMap;

const float PI = 3.14159265359;
const float gamma = 2.2;

void main(void) {
    vec3 irradiance = vec3(0.0);

    // the sample direction equals the hemisphere's orientation
    vec3 normal = normalize(vLocalPos);

    vec3 up    = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, normal));
    up         = normalize(cross(normal, right));

    const float sampleDelta = 0.025;
    float nrSamples = 0.0;
    for(float phi = 0.0; phi < 2.0 * PI; phi += sampleDelta)
    {
        for(float theta = 0.0; theta < 0.5 * PI; theta += sampleDelta)
        {
            // spherical to cartesian (in tangent space)
            vec3 tangentSample = vec3(sin(theta) * cos(phi),  sin(theta) * sin(phi), cos(theta));
            // tangent space to world
            vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * normal;

            irradiance += pow(textureCube(uEnvironmentMap, sampleVec).rgb, vec3(gamma)) * cos(theta) * sin(theta);
            nrSamples++;
        }
    }
    irradiance = PI * irradiance * (1.0 / float(nrSamples));

    gl_FragColor = vec4(irradiance, 1.0);
}`,Uh=`#version 300 es

in vec3 aPos;

out vec3 vLocalPos;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main(void) {
    vLocalPos = aPos;
    gl_Position = uPMatrix * uMVMatrix * vec4(aPos, 1.0);
}`,Ch=`#version 300 es
precision mediump float;

out vec4 FragColor;

in vec3 vLocalPos;

uniform samplerCube uEnvironmentMap;
uniform float uRoughness;

const float PI = 3.14159265359;
const float gamma = 2.2;

float RadicalInverse_VdC(uint bits) {
    bits = (bits << 16u) | (bits >> 16u);
    bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
    bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
    bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
    bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
    return float(bits) * 2.3283064365386963e-10; // / 0x100000000
}

vec2 Hammersley(uint i, uint N) {
    return vec2(float(i)/float(N), RadicalInverse_VdC(i));
}

vec3 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness) {
    float a = roughness * roughness;

    float phi = 2.0 * PI * Xi.x;
    float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));
    float sinTheta = sqrt(1.0 - cosTheta*cosTheta);

    // from spherical coordinates to cartesian coordinates
    vec3 H;
    H.x = cos(phi) * sinTheta;
    H.y = sin(phi) * sinTheta;
    H.z = cosTheta;

    // from tangent-space vector to world-space sample vector
    vec3 up        = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangent   = normalize(cross(up, N));
    vec3 bitangent = cross(N, tangent);

    vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;

    return normalize(sampleVec);
}

void main() {
    vec3 N = normalize(vLocalPos);
    vec3 R = N;
    vec3 V = R;

    const uint SAMPLE_COUNT = 1024u;
    float totalWeight = 0.0;
    vec3 prefilteredColor = vec3(0.0);
    for(uint i = 0u; i < SAMPLE_COUNT; ++i)
    {
        vec2 Xi = Hammersley(i, SAMPLE_COUNT);
        vec3 H  = ImportanceSampleGGX(Xi, N, uRoughness);
        vec3 L  = normalize(2.0 * dot(V, H) * H - V);

        float NdotL = max(dot(N, L), 0.0);
        if(NdotL > 0.0) {
            prefilteredColor += pow(texture(uEnvironmentMap, L).rgb, vec3(gamma)) * NdotL;
            totalWeight      += NdotL;
        }
    }
    prefilteredColor = prefilteredColor / totalWeight;

    FragColor = vec4(prefilteredColor, 1.0);
}`,Bh=`#version 300 es

in vec3 aPos;

out vec2 vLocalPos;

void main(void) {
    vLocalPos = aPos.xy;
    gl_Position = vec4(aPos, 1.0);
}`,Eh=`#version 300 es
precision mediump float;

in vec2 vLocalPos;

out vec4 FragColor;

const float PI = 3.14159265359;

float RadicalInverse_VdC(uint bits) {
    bits = (bits << 16u) | (bits >> 16u);
    bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
    bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
    bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
    bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
    return float(bits) * 2.3283064365386963e-10; // / 0x100000000
}

vec2 Hammersley(uint i, uint N) {
    return vec2(float(i)/float(N), RadicalInverse_VdC(i));
}

vec3 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness) {
    float a = roughness * roughness;

    float phi = 2.0 * PI * Xi.x;
    float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));
    float sinTheta = sqrt(1.0 - cosTheta*cosTheta);

    // from spherical coordinates to cartesian coordinates
    vec3 H;
    H.x = cos(phi) * sinTheta;
    H.y = sin(phi) * sinTheta;
    H.z = cosTheta;

    // from tangent-space vector to world-space sample vector
    vec3 up        = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangent   = normalize(cross(up, N));
    vec3 bitangent = cross(N, tangent);

    vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;

    return normalize(sampleVec);
}

float geometrySchlickGGX(float nDotV, float roughness) {
    float r = roughness;
    float k = r * r / 2.;

    float num = nDotV;
    float denom = nDotV * (1. - k) + k;

    return num / denom;
}

float geometrySmith(vec3 normal, vec3 viewDir, vec3 lightDir, float roughness) {
    float nDotV = max(dot(normal, viewDir), .0);
    float nDotL = max(dot(normal, lightDir), .0);
    float ggx2  = geometrySchlickGGX(nDotV, roughness);
    float ggx1  = geometrySchlickGGX(nDotL, roughness);

    return ggx1 * ggx2;
}

vec2 IntegrateBRDF(float NdotV, float roughness) {
    vec3 V;
    V.x = sqrt(1.0 - NdotV*NdotV);
    V.y = 0.0;
    V.z = NdotV;

    float A = 0.0;
    float B = 0.0;

    vec3 N = vec3(0.0, 0.0, 1.0);

    const uint SAMPLE_COUNT = 1024u;
    for(uint i = 0u; i < SAMPLE_COUNT; ++i)
    {
        vec2 Xi = Hammersley(i, SAMPLE_COUNT);
        vec3 H  = ImportanceSampleGGX(Xi, N, roughness);
        vec3 L  = normalize(2.0 * dot(V, H) * H - V);

        float NdotL = max(L.z, 0.0);
        float NdotH = max(H.z, 0.0);
        float VdotH = max(dot(V, H), 0.0);

        if(NdotL > 0.0)
        {
            float G = geometrySmith(N, V, L, roughness);
            float G_Vis = (G * VdotH) / (NdotH * NdotV);
            float Fc = pow(1.0 - VdotH, 5.0);

            A += (1.0 - Fc) * G_Vis;
            B += Fc * G_Vis;
        }
    }
    A /= float(SAMPLE_COUNT);
    B /= float(SAMPLE_COUNT);
    return vec2(A, B);
}

void main() {
    FragColor = vec4(IntegrateBRDF((vLocalPos.x + 1.0) * .5, (vLocalPos.y + 1.0) * .5), 0., 1.);
}`,Ah=`struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
    nodesMatrices: array<mat4x4f, \${MAX_NODES}>,
}

struct FSUniforms {
    replaceableColor: vec3f,
    replaceableType: u32,
    discardAlphaLevel: f32,
    wireframe: u32,
    tVertexAnim: mat3x3f,
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(1) @binding(0) var<uniform> fsUniforms: FSUniforms;
@group(1) @binding(1) var fsUniformSampler: sampler;
@group(1) @binding(2) var fsUniformTexture: texture_2d<f32>;

struct VSIn {
    @location(0) vertexPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) textureCoord: vec2f,
    @location(3) group: vec4<u32>,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f,
    @location(1) textureCoord: vec2f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var position: vec4f = vec4f(in.vertexPosition, 1.0);
    var count: i32 = 1;
    var sum: vec4f = vsUniforms.nodesMatrices[in.group[0]] * position;

    if (in.group[1] < \${MAX_NODES}) {
        sum += vsUniforms.nodesMatrices[in.group[1]] * position;
        count += 1;
    }
    if (in.group[2] < \${MAX_NODES}) {
        sum += vsUniforms.nodesMatrices[in.group[2]] * position;
        count += 1;
    }
    if (in.group[3] < \${MAX_NODES}) {
        sum += vsUniforms.nodesMatrices[in.group[3]] * position;
        count += 1;
    }
    sum /= f32(count);
    sum.w = 1.;
    position = sum;

    var out: VSOut;
    out.position = vsUniforms.pMatrix * vsUniforms.mvMatrix * position;
    out.textureCoord = in.textureCoord;
    out.normal = in.normal;
    return out;
}

fn hypot(z: vec2f) -> f32 {
    var t: f32 = 0;
    var x: f32 = abs(z.x);
    let y: f32 = abs(z.y);
    t = min(x, y);
    x = max(x, y);
    t = t / x;
    if (z.x == 0.0 && z.y == 0.0) {
        return 0.0;
    }
    return x * sqrt(1.0 + t * t);
}

@fragment fn fs(
    in: VSOut
) -> @location(0) vec4f {
    if (fsUniforms.wireframe > 0) {
        return vec4f(1);
    }

    let texCoord: vec2f = (fsUniforms.tVertexAnim * vec3f(in.textureCoord.x, in.textureCoord.y, 1.)).xy;
    var color: vec4f = vec4f(0.0);

    if (fsUniforms.replaceableType == 0) {
        color = textureSample(fsUniformTexture, fsUniformSampler, texCoord);
    } else if (fsUniforms.replaceableType == 1) {
        color = vec4f(fsUniforms.replaceableColor, 1.0);
    } else if (fsUniforms.replaceableType == 2) {
        let dist: f32 = hypot(texCoord - vec2(0.5, 0.5)) * 2.;
        let truncateDist: f32 = clamp(1. - dist * 1.4, 0., 1.);
        let alpha: f32 = sin(truncateDist);
        color = vec4f(fsUniforms.replaceableColor * alpha, 1.0);
    }

    // hand-made alpha-test
    if (color.a < fsUniforms.discardAlphaLevel) {
        discard;
    }

    return color;
}
`,Mh=`struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
    nodesMatrices: array<mat4x4f, \${MAX_NODES}>,
}

struct FSUniforms {
    replaceableColor: vec3f,
    // replaceableType: u32,
    discardAlphaLevel: f32,
    tVertexAnim: mat3x3f,
    lightPos: vec3f,
    hasEnv: u32,
    lightColor: vec3f,
    wireframe: u32,
    cameraPos: vec3f,
    shadowParams: vec3f,
    shadowMapLightMatrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(1) @binding(0) var<uniform> fsUniforms: FSUniforms;
@group(1) @binding(1) var fsUniformDiffuseSampler: sampler;
@group(1) @binding(2) var fsUniformDiffuseTexture: texture_2d<f32>;
@group(1) @binding(3) var fsUniformNormalSampler: sampler;
@group(1) @binding(4) var fsUniformNormalTexture: texture_2d<f32>;
@group(1) @binding(5) var fsUniformOrmSampler: sampler;
@group(1) @binding(6) var fsUniformOrmTexture: texture_2d<f32>;
@group(1) @binding(7) var fsUniformShadowSampler: sampler_comparison;
@group(1) @binding(8) var fsUniformShadowTexture: texture_depth_2d;
@group(1) @binding(9) var irradienceMapSampler: sampler;
@group(1) @binding(10) var irradienceMapTexture: texture_cube<f32>;
@group(1) @binding(11) var prefilteredEnvSampler: sampler;
@group(1) @binding(12) var prefilteredEnvTexture: texture_cube<f32>;
@group(1) @binding(13) var brdfLutSampler: sampler;
@group(1) @binding(14) var brdfLutTexture: texture_2d<f32>;

struct VSIn {
    @location(0) vertexPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) textureCoord: vec2f,
    @location(3) tangent: vec4f,
    @location(4) skin: vec4<u32>,
    @location(5) boneWeight: vec4f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f,
    @location(1) textureCoord: vec2f,
    @location(2) tangent: vec3f,
    @location(3) binormal: vec3f,
    @location(4) fragPos: vec3f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var position: vec4f = vec4f(in.vertexPosition, 1.0);
    var sum: mat4x4f;

    sum += vsUniforms.nodesMatrices[in.skin[0]] * in.boneWeight[0];
    sum += vsUniforms.nodesMatrices[in.skin[1]] * in.boneWeight[1];
    sum += vsUniforms.nodesMatrices[in.skin[2]] * in.boneWeight[2];
    sum += vsUniforms.nodesMatrices[in.skin[3]] * in.boneWeight[3];

    let rotation: mat3x3f = mat3x3f(sum[0].xyz, sum[1].xyz, sum[2].xyz);

    position = sum * position;
    position.w = 1;

    var out: VSOut;
    out.position = vsUniforms.pMatrix * vsUniforms.mvMatrix * position;
    out.textureCoord = in.textureCoord;
    out.normal = in.normal;

    var normal: vec3f = in.normal;
    var tangent: vec3f = in.tangent.xyz;

    // https://learnopengl.com/Advanced-Lighting/Normal-Mapping
    tangent = normalize(tangent - dot(tangent, normal) * normal);

    var binormal: vec3f = cross(normal, tangent) * in.tangent.w;

    normal = normalize(rotation * normal);
    tangent = normalize(rotation * tangent);
    binormal = normalize(rotation * binormal);

    out.normal = normal;
    out.tangent = tangent;
    out.binormal = binormal;

    out.fragPos = position.xyz;

    return out;
}

fn hypot(z: vec2f) -> f32 {
    var t: f32 = 0;
    var x: f32 = abs(z.x);
    let y: f32 = abs(z.y);
    t = min(x, y);
    x = max(x, y);
    t = t / x;
    if (z.x == 0.0 && z.y == 0.0) {
        return 0.0;
    }
    return x * sqrt(1.0 + t * t);
}

const PI: f32 = 3.14159265359;
const gamma: f32 = 2.2;
const MAX_REFLECTION_LOD: f32 = \${MAX_ENV_MIP_LEVELS};

fn distributionGGX(normal: vec3f, halfWay: vec3f, roughness: f32) -> f32 {
    let a: f32 = roughness * roughness;
    let a2: f32 = a * a;
    let nDotH: f32 = max(dot(normal, halfWay), 0.0);
    let nDotH2: f32 = nDotH * nDotH;

    let num: f32 = a2;
    var denom: f32 = (nDotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num / denom;
}

fn geometrySchlickGGX(nDotV: f32, roughness: f32) -> f32 {
    let r: f32 = roughness + 1.;
    let k: f32 = r * r / 8.;
    // float k = roughness * roughness / 2.;

    let num: f32 = nDotV;
    let denom: f32 = nDotV * (1. - k) + k;

    return num / denom;
}

fn geometrySmith(normal: vec3f, viewDir: vec3f, lightDir: vec3f, roughness: f32) -> f32 {
    let nDotV: f32 = max(dot(normal, viewDir), .0);
    let nDotL: f32 = max(dot(normal, lightDir), .0);
    let ggx2: f32  = geometrySchlickGGX(nDotV, roughness);
    let ggx1: f32  = geometrySchlickGGX(nDotL, roughness);

    return ggx1 * ggx2;
}

fn fresnelSchlick(lightFactor: f32, f0: vec3f) -> vec3f {
    return f0 + (1. - f0) * pow(clamp(1. - lightFactor, 0., 1.), 5.);
}

fn fresnelSchlickRoughness(lightFactor: f32, f0: vec3f, roughness: f32) -> vec3f {
    return f0 + (max(vec3(1.0 - roughness), f0) - f0) * pow(clamp(1.0 - lightFactor, 0.0, 1.0), 5.0);
}

@fragment fn fs(
    in: VSOut,
    @builtin(front_facing) isFront: bool
) -> @location(0) vec4f {
    if (fsUniforms.wireframe > 0) {
        return vec4f(1);
    }

    let texCoord: vec2f = (fsUniforms.tVertexAnim * vec3f(in.textureCoord.x, in.textureCoord.y, 1.)).xy;
    var baseColor: vec4f = textureSample(fsUniformDiffuseTexture, fsUniformDiffuseSampler, texCoord);

    // hand-made alpha-test
    if (baseColor.a < fsUniforms.discardAlphaLevel) {
        discard;
    }

    let orm: vec4f = textureSample(fsUniformOrmTexture, fsUniformOrmSampler, texCoord);

    let occlusion: f32 = orm.r;
    let roughness: f32 = orm.g;
    let metallic: f32 = orm.b;
    let teamColorFactor: f32 = orm.a;

    var teamColor: vec3f = baseColor.rgb * fsUniforms.replaceableColor;
    baseColor = vec4(mix(baseColor.rgb, teamColor, teamColorFactor), baseColor.a);
    baseColor = vec4(pow(baseColor.rgb, vec3f(gamma)), baseColor.a);

    let TBN: mat3x3f = mat3x3f(in.tangent, in.binormal, in.normal);

    var normal: vec3f = textureSample(fsUniformNormalTexture, fsUniformNormalSampler, texCoord).xyz;
    normal = normal * 2 - 1;
    normal.x = -normal.x;
    normal.y = -normal.y;
    if (!isFront) {
        normal = -normal;
    }
    normal = normalize(TBN * -normal);

    let viewDir: vec3f = normalize(fsUniforms.cameraPos - in.fragPos);
    let reflected = reflect(-viewDir, normal);

    let lightDir: vec3f = normalize(fsUniforms.lightPos - in.fragPos);
    let lightFactor: f32 = max(dot(normal, lightDir), 0);
    let radiance: vec3f = fsUniforms.lightColor;

    var f0 = vec3f(.04);
    f0 = mix(f0, baseColor.rgb, metallic);

    var totalLight: vec3f = vec3f(0);
    let halfWay: vec3f = normalize(viewDir + lightDir);
    let ndf: f32 = distributionGGX(normal, halfWay, roughness);
    let g: f32 = geometrySmith(normal, viewDir, lightDir, roughness);
    let f: vec3f = fresnelSchlick(max(dot(halfWay, viewDir), 0), f0);

    let kS = f;
    var kD = vec3f(1);// - kS;
    if (fsUniforms.hasEnv > 0) {
        kD *= 1 - metallic;
    }
    let num: vec3f = ndf * g * f;
    let denom: f32 = 4. * max(dot(normal, viewDir), 0.) * max(dot(normal, lightDir), 0.) + .0001;
    var specular: vec3f = num / denom;

    totalLight = (kD * baseColor.rgb / PI + specular) * radiance * lightFactor;

    if (fsUniforms.shadowParams[0] > .5) {
        let shadowBias: f32 = fsUniforms.shadowParams[1];
        let shadowStep: f32 = fsUniforms.shadowParams[2];
        let fragInLightPos: vec4f = fsUniforms.shadowMapLightMatrix * vec4f(in.fragPos, 1.);
        var shadowMapCoord: vec3f = fragInLightPos.xyz / fragInLightPos.w;
        shadowMapCoord = vec3f((shadowMapCoord.xy + 1) * .5, shadowMapCoord.z);
        shadowMapCoord.y = 1 - shadowMapCoord.y;

        let passes: u32 = 5;
        let step: f32 = 1. / f32(passes);

        let currentDepth: f32 = shadowMapCoord.z;
        var lightDepth: f32 = textureSampleCompare(fsUniformShadowTexture, fsUniformShadowSampler, shadowMapCoord.xy, currentDepth - shadowBias);
        let lightDepth0: f32 = textureSampleCompare(fsUniformShadowTexture, fsUniformShadowSampler, vec2f(shadowMapCoord.x + shadowStep, shadowMapCoord.y), currentDepth - shadowBias);
        let lightDepth1: f32 = textureSampleCompare(fsUniformShadowTexture, fsUniformShadowSampler, vec2f(shadowMapCoord.x, shadowMapCoord.y + shadowStep), currentDepth - shadowBias);
        let lightDepth2: f32 = textureSampleCompare(fsUniformShadowTexture, fsUniformShadowSampler, vec2f(shadowMapCoord.x, shadowMapCoord.y - shadowStep), currentDepth - shadowBias);
        let lightDepth3: f32 = textureSampleCompare(fsUniformShadowTexture, fsUniformShadowSampler, vec2f(shadowMapCoord.x - shadowStep, shadowMapCoord.y), currentDepth - shadowBias);

        var visibility: f32 = 0.;
        if (lightDepth > .5) {
            visibility += step;
        }
        if (lightDepth0 > .5) {
            visibility += step;
        }
        if (lightDepth1 > .5) {
            visibility += step;
        }
        if (lightDepth2 > .5) {
            visibility += step;
        }
        if (lightDepth3 > .5) {
            visibility += step;
        }

        totalLight *= visibility;
    }

    var color: vec3f = vec3f(0.0);

    if (fsUniforms.hasEnv > 0) {
        let f: vec3f = fresnelSchlickRoughness(max(dot(normal, viewDir), 0.0), f0, roughness);
        let kS: vec3f = f;
        var kD: vec3f = vec3f(1.0) - kS;
        kD *= 1.0 - metallic;

        let diffuse: vec3f = textureSample(irradienceMapTexture, irradienceMapSampler, normal).rgb * baseColor.rgb;
        let prefilteredColor: vec3f = textureSampleLevel(prefilteredEnvTexture, prefilteredEnvSampler, reflected, roughness * MAX_REFLECTION_LOD).rgb;
        let envBRDF: vec2f = textureSample(brdfLutTexture, brdfLutSampler, vec2f(max(dot(normal, viewDir), 0.0), roughness)).rg;
        specular = prefilteredColor * (f * envBRDF.x + envBRDF.y);

        let ambient: vec3f = (kD * diffuse + specular) * occlusion;
        color = ambient + totalLight;
    } else {
        var ambient: vec3f = vec3(.03);
        ambient *= baseColor.rgb * occlusion;
        color = ambient + totalLight;
    }

    color = color / (vec3f(1) + color);
    color = pow(color, vec3f(1 / gamma));

    return vec4f(color, baseColor.a);
}
`,_h=`struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
    nodesMatrices: array<mat4x4f, \${MAX_NODES}>,
}

struct FSUniforms {
    replaceableColor: vec3f,
    // replaceableType: u32,
    discardAlphaLevel: f32,
    tVertexAnim: mat3x3f,
    lightPos: vec3f,
    lightColor: vec3f,
    cameraPos: vec3f,
    shadowParams: vec3f,
    shadowMapLightMatrix: mat4x4f,
    // env
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(1) @binding(0) var<uniform> fsUniforms: FSUniforms;
@group(1) @binding(1) var fsUniformDiffuseSampler: sampler;
@group(1) @binding(2) var fsUniformDiffuseTexture: texture_2d<f32>;
@group(1) @binding(3) var fsUniformNormalSampler: sampler;
@group(1) @binding(4) var fsUniformNormalTexture: texture_2d<f32>;
@group(1) @binding(5) var fsUniformOrmSampler: sampler;
@group(1) @binding(6) var fsUniformOrmTexture: texture_2d<f32>;
@group(1) @binding(7) var fsUniformShadowSampler: sampler_comparison;
// @group(1) @binding(7) var fsUniformShadowSampler: sampler;
@group(1) @binding(8) var fsUniformShadowTexture: texture_depth_2d;

struct VSIn {
    @location(0) vertexPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) textureCoord: vec2f,
    @location(3) tangent: vec4f,
    @location(4) skin: vec4<u32>,
    @location(5) boneWeight: vec4f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) textureCoord: vec2f,
    @location(1) depth: f32,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var position: vec4f = vec4f(in.vertexPosition, 1.0);
    var sum: mat4x4f;

    sum += vsUniforms.nodesMatrices[in.skin[0]] * in.boneWeight[0];
    sum += vsUniforms.nodesMatrices[in.skin[1]] * in.boneWeight[1];
    sum += vsUniforms.nodesMatrices[in.skin[2]] * in.boneWeight[2];
    sum += vsUniforms.nodesMatrices[in.skin[3]] * in.boneWeight[3];

    position = sum * position;
    position.w = 1;

    var out: VSOut;
    out.position = vsUniforms.pMatrix * vsUniforms.mvMatrix * position;
    out.textureCoord = in.textureCoord;

    out.depth = out.position.z / out.position.w;

    return out;
}

struct FSOut {
    @builtin(frag_depth) depth: f32,
    @location(0) color: vec4f
}

@fragment fn fs(
    in: VSOut,
    @builtin(front_facing) isFront: bool
) -> FSOut {
    let texCoord: vec2f = (fsUniforms.tVertexAnim * vec3f(in.textureCoord.x, in.textureCoord.y, 1.)).xy;
    var baseColor: vec4f = textureSample(fsUniformDiffuseTexture, fsUniformDiffuseSampler, texCoord);

    // hand-made alpha-test
    if (baseColor.a < fsUniforms.discardAlphaLevel) {
        discard;
    }

    var out: FSOut;
    out.color = vec4f(1, 1, 1, 1);
    out.depth = in.depth;
    return out;
}
`,Dh=`struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;

struct VSIn {
    @location(0) vertexPosition: vec3f,
    @location(1) color: vec3f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec3f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var position: vec4f = vec4f(in.vertexPosition, 1.0);

    var out: VSOut;
    out.position = vsUniforms.pMatrix * vsUniforms.mvMatrix * position;
    out.color = in.color;
    return out;
}

@fragment fn fs(
    in: VSOut
) -> @location(0) vec4f {
    return vec4f(in.color, 1);
}
`,Lh=`struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(1) @binding(0) var fsUniformSampler: sampler;
@group(1) @binding(1) var fsUniformTexture: texture_cube<f32>;

struct VSIn {
    @location(0) vertexPosition: vec3f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) localPos: vec3f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    let rotView: mat4x4f = mat4x4f(
        vec4f(vsUniforms.mvMatrix[0].xyz, 0),
        vec4f(vsUniforms.mvMatrix[1].xyz, 0),
        vec4f(vsUniforms.mvMatrix[2].xyz, 0),
        vec4f(0, 0, 0, 1)
    );

    let clipPos: vec4f = vsUniforms.pMatrix * rotView * 1000. * vec4f(in.vertexPosition, 1.0);

    var out: VSOut;
    out.position = clipPos;
    out.localPos = in.vertexPosition;
    return out;
}

@fragment fn fs(
    in: VSOut
) -> @location(0) vec4f {
    return textureSample(fsUniformTexture, fsUniformSampler, in.localPos);
}
`,Rh=`const invAtan: vec2f = vec2f(0.1591, 0.3183);

struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(1) @binding(0) var fsUniformSampler: sampler;
@group(1) @binding(1) var fsUniformTexture: texture_2d<f32>;

struct VSIn {
    @location(0) vertexPosition: vec3f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) localPos: vec3f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var out: VSOut;
    out.position = vsUniforms.pMatrix * vsUniforms.mvMatrix * vec4f(in.vertexPosition, 1);
    out.localPos = in.vertexPosition;
    return out;
}

fn SampleSphericalMap(v: vec3f) -> vec2f {
    // vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    var uv: vec2f = vec2f(atan2(v.x, v.y), asin(-v.z));
    uv *= invAtan;
    uv += 0.5;
    return uv;
}

@fragment fn fs(
    in: VSOut
) -> @location(0) vec4f {
    let uv: vec2f = SampleSphericalMap(normalize(in.localPos)); // make sure to normalize localPos
    let color: vec3f = textureSample(fsUniformTexture, fsUniformSampler, uv).rgb;

    return vec4f(color, 1.0);
}
`,Fh=`const PI: f32 = 3.14159265359;
const gamma: f32 = 2.2;
const sampleDelta: f32 = 0.025;

struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(1) @binding(0) var fsUniformSampler: sampler;
@group(1) @binding(1) var fsUniformTexture: texture_cube<f32>;

struct VSIn {
    @location(0) vertexPosition: vec3f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) localPos: vec3f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var out: VSOut;
    out.position = vsUniforms.pMatrix * vsUniforms.mvMatrix * vec4f(in.vertexPosition, 1);
    out.localPos = in.vertexPosition;
    return out;
}

@fragment fn fs(
    in: VSOut
) -> @location(0) vec4f {
    var irradiance: vec3f = vec3f(0);

    // the sample direction equals the hemisphere's orientation
    let normal: vec3f = normalize(in.localPos);

    var up: vec3f = vec3f(0.0, 1.0, 0.0);
    let right: vec3f = normalize(cross(up, normal));
    up = normalize(cross(normal, right));

    var nrSamples: i32 = 0;
    for (var phi: f32 = 0.0; phi < 2.0 * PI; phi += sampleDelta)
    {
        for (var theta: f32 = 0.0; theta < 0.5 * PI; theta += sampleDelta)
        {
            // spherical to cartesian (in tangent space)
            let tangentSample: vec3f = vec3f(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
            // tangent space to world
            let sampleVec: vec3f = tangentSample.x * right + tangentSample.y * up + tangentSample.z * normal;

            irradiance += pow(textureSample(fsUniformTexture, fsUniformSampler, sampleVec).rgb, vec3f(gamma)) * cos(theta) * sin(theta);
            nrSamples++;
        }
    }
    irradiance = PI * irradiance * (1.0 / f32(nrSamples));

    return vec4f(irradiance, 1.0);
}
`,$h=`const PI: f32 = 3.14159265359;
const gamma: f32 = 2.2;

struct VSUniforms {
    mvMatrix: mat4x4f,
    pMatrix: mat4x4f,
}

struct FSUniforms {
    roughness: f32,
}

@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;
@group(1) @binding(0) var<uniform> fsUniforms: FSUniforms;
@group(1) @binding(1) var fsUniformSampler: sampler;
@group(1) @binding(2) var fsUniformTexture: texture_cube<f32>;

struct VSIn {
    @location(0) vertexPosition: vec3f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) localPos: vec3f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var out: VSOut;
    out.position = vsUniforms.pMatrix * vsUniforms.mvMatrix * vec4f(in.vertexPosition, 1);
    out.localPos = in.vertexPosition;
    return out;
}

fn RadicalInverse_VdC(bits: u32) -> f32 {
    var res: u32 = bits;
    res = (res << 16u) | (res >> 16u);
    res = ((res & 0x55555555u) << 1u) | ((res & 0xAAAAAAAAu) >> 1u);
    res = ((res & 0x33333333u) << 2u) | ((res & 0xCCCCCCCCu) >> 2u);
    res = ((res & 0x0F0F0F0Fu) << 4u) | ((res & 0xF0F0F0F0u) >> 4u);
    res = ((res & 0x00FF00FFu) << 8u) | ((res & 0xFF00FF00u) >> 8u);
    return f32(res) * 2.3283064365386963e-10; // / 0x100000000
}

fn Hammersley(i: u32, N: u32) -> vec2f {
    return vec2f(f32(i)/f32(N), RadicalInverse_VdC(i));
}

fn ImportanceSampleGGX(Xi: vec2f, N: vec3f, roughness: f32) -> vec3f {
    let a: f32 = roughness * roughness;

    let phi: f32 = 2.0 * PI * Xi.x;
    let cosTheta: f32 = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));
    let sinTheta: f32 = sqrt(1.0 - cosTheta*cosTheta);

    // from spherical coordinates to cartesian coordinates
    var H: vec3f;
    H.x = cos(phi) * sinTheta;
    H.y = sin(phi) * sinTheta;
    H.z = cosTheta;

    // from tangent-space vector to world-space sample vector
    var up: vec3f;
    if (abs(N.z) < 0.999) {
        up = vec3f(0.0, 0.0, 1.0);
    } else {
        up = vec3f(1.0, 0.0, 0.0);
    }
    let tangent: vec3f   = normalize(cross(up, N));
    let bitangent: vec3f = cross(N, tangent);

    let sampleVec: vec3f = tangent * H.x + bitangent * H.y + N * H.z;

    return normalize(sampleVec);
}

@fragment fn fs(
    in: VSOut
) -> @location(0) vec4f {
    let N: vec3f = normalize(in.localPos);
    let R: vec3f = N;
    let V: vec3f = R;

    const SAMPLE_COUNT: u32 = 1024u;
    var totalWeight: f32 = 0.0;
    var prefilteredColor: vec3f = vec3f(0.0);
    for(var i: u32 = 0u; i < SAMPLE_COUNT; i++)
    {
        let Xi: vec2f = Hammersley(i, SAMPLE_COUNT);
        let H: vec3f  = ImportanceSampleGGX(Xi, N, fsUniforms.roughness);
        let L: vec3f  = normalize(2.0 * dot(V, H) * H - V);

        let NdotL: f32 = max(dot(N, L), 0.0);
        if(NdotL > 0.0) {
            prefilteredColor += pow(textureSampleLevel(fsUniformTexture, fsUniformSampler, L, 0).rgb, vec3f(gamma)) * NdotL;
            totalWeight      += NdotL;
        }
    }
    prefilteredColor = prefilteredColor / totalWeight;

    return vec4f(prefilteredColor, 1.0);
}
`,Vh=`const PI: f32 = 3.14159265359;

struct VSIn {
    @location(0) vertexPosition: vec3f,
}

struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) localPos: vec3f,
}

@vertex fn vs(
    in: VSIn
) -> VSOut {
    var out: VSOut;
    out.position = vec4f(in.vertexPosition, 1);
    out.localPos = in.vertexPosition;
    return out;
}

fn RadicalInverse_VdC(bits: u32) -> f32 {
    var res: u32 = bits;
    res = (res << 16u) | (res >> 16u);
    res = ((res & 0x55555555u) << 1u) | ((res & 0xAAAAAAAAu) >> 1u);
    res = ((res & 0x33333333u) << 2u) | ((res & 0xCCCCCCCCu) >> 2u);
    res = ((res & 0x0F0F0F0Fu) << 4u) | ((res & 0xF0F0F0F0u) >> 4u);
    res = ((res & 0x00FF00FFu) << 8u) | ((res & 0xFF00FF00u) >> 8u);
    return f32(res) * 2.3283064365386963e-10; // / 0x100000000
}

fn Hammersley(i: u32, N: u32) -> vec2f {
    return vec2f(f32(i)/f32(N), RadicalInverse_VdC(i));
}

fn ImportanceSampleGGX(Xi: vec2f, N: vec3f, roughness: f32) -> vec3f {
    let a: f32 = roughness * roughness;

    let phi: f32 = 2.0 * PI * Xi.x;
    let cosTheta: f32 = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));
    let sinTheta: f32 = sqrt(1.0 - cosTheta*cosTheta);

    // from spherical coordinates to cartesian coordinates
    var H: vec3f;
    H.x = cos(phi) * sinTheta;
    H.y = sin(phi) * sinTheta;
    H.z = cosTheta;

    // from tangent-space vector to world-space sample vector
    var up: vec3f;
    if (abs(N.z) < 0.999) {
        up = vec3f(0.0, 0.0, 1.0);
    } else {
        up = vec3f(1.0, 0.0, 0.0);
    }
    let tangent: vec3f   = normalize(cross(up, N));
    let bitangent: vec3f = cross(N, tangent);

    let sampleVec: vec3f = tangent * H.x + bitangent * H.y + N * H.z;

    return normalize(sampleVec);
}

fn geometrySchlickGGX(nDotV: f32, roughness: f32) -> f32 {
    let r: f32 = roughness + 1.;
    let k: f32 = r * r / 8.;
    // float k = roughness * roughness / 2.;

    let num: f32 = nDotV;
    let denom: f32 = nDotV * (1. - k) + k;

    return num / denom;
}

fn geometrySmith(normal: vec3f, viewDir: vec3f, lightDir: vec3f, roughness: f32) -> f32 {
    let nDotV: f32 = max(dot(normal, viewDir), .0);
    let nDotL: f32 = max(dot(normal, lightDir), .0);
    let ggx2: f32  = geometrySchlickGGX(nDotV, roughness);
    let ggx1: f32  = geometrySchlickGGX(nDotL, roughness);

    return ggx1 * ggx2;
}

fn IntegrateBRDF(NdotV: f32, roughness: f32) -> vec2f {
    var V: vec3f;
    V.x = sqrt(1.0 - NdotV*NdotV);
    V.y = 0.0;
    V.z = NdotV;

    var A: f32 = 0.0;
    var B: f32 = 0.0;

    let N: vec3f = vec3f(0.0, 0.0, 1.0);

    const SAMPLE_COUNT: u32 = 1024u;
    for(var i: u32 = 0u; i < SAMPLE_COUNT; i++) {
        let Xi: vec2f = Hammersley(i, SAMPLE_COUNT);
        let H: vec3f  = ImportanceSampleGGX(Xi, N, roughness);
        let L: vec3f  = normalize(2.0 * dot(V, H) * H - V);

        let NdotL: f32 = max(L.z, 0.0);
        let NdotH: f32 = max(H.z, 0.0);
        let VdotH: f32 = max(dot(V, H), 0.0);

        if (NdotL > 0.0) {
            let G: f32 = geometrySmith(N, V, L, roughness);
            let G_Vis: f32 = (G * VdotH) / (NdotH * NdotV);
            let Fc: f32 = pow(1.0 - VdotH, 5.0);

            A += (1.0 - Fc) * G_Vis;
            B += Fc * G_Vis;
        }
    }
    A /= f32(SAMPLE_COUNT);
    B /= f32(SAMPLE_COUNT);

    return vec2f(A, B);
}

@fragment fn fs(
    in: VSOut
) -> @location(0) vec4f {
    return vec4f(IntegrateBRDF((in.localPos.x + 1.0) * .5, (in.localPos.y + 1.0) * .5), 0., 1.);
}
`,kh=`struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) texCoord: vec2f,
};

@vertex fn vs(
    @location(0) position: vec2f
) -> VSOut {
    var vsOutput: VSOut;
    vsOutput.position = vec4f(position * 2.0 - 1.0, 0.0, 1.0);
    vsOutput.texCoord = vec2f(position.x, 1.0 - position.y);
    return vsOutput;
}

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var textureView: texture_2d<f32>;

@fragment fn fs(
    fsInput: VSOut
) -> @location(0) vec4f {
    return textureSample(textureView, textureSampler, fsInput.texCoord);
}`;let _s,Ci,Br;const Bi=new WeakMap;function Ds(t,e){Br||(Br=t.createBuffer({label:"mips vertex buffer",size:48,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(Br.getMappedRange(0,Br.size)).set([0,0,1,0,0,1,0,1,1,0,1,1]),Br.unmap(),Ci=t.createShaderModule({label:"mips shader module",code:kh}),_s=t.createSampler({label:"mips sampler",minFilter:"linear"})),Bi[e.format]||(Bi[e.format]=t.createRenderPipeline({label:"mips pipeline",layout:"auto",vertex:{module:Ci,buffers:[{arrayStride:8,attributes:[{shaderLocation:0,offset:0,format:"float32x2"}]}]},fragment:{module:Ci,targets:[{format:e.format}]}}));const r=Bi[e.format],n=t.createCommandEncoder({label:"mips encoder"});for(let o=1;o<e.mipLevelCount;++o)for(let s=0;s<e.depthOrArrayLayers;++s){const a=t.createBindGroup({layout:r.getBindGroupLayout(0),entries:[{binding:0,resource:_s},{binding:1,resource:e.createView({dimension:"2d",baseMipLevel:o-1,mipLevelCount:1,baseArrayLayer:s,arrayLayerCount:1})}]}),c={label:"mips render pass",colorAttachments:[{view:e.createView({dimension:"2d",baseMipLevel:o,mipLevelCount:1,baseArrayLayer:s,arrayLayerCount:1}),loadOp:"clear",storeOp:"store"}]},u=n.beginRenderPass(c);u.setPipeline(r),u.setVertexBuffer(0,Br),u.setBindGroup(0,a),u.draw(6),u.end()}const i=n.finish();t.queue.submit([i])}const Ye=254,Er=2048,Ar=32,mr=128,Ft=8,Mr=512,Sn=4,Ih=new Set([0,1]),Gh=uh.replace(/\$\{MAX_NODES}/g,String(Ye)),Nh=hh.replace(/\$\{MAX_NODES}/g,String(Ye)),Oh=gh.replace(/\$\{MAX_NODES}/g,String(Ye)),Hh=ph.replace(/\$\{MAX_ENV_MIP_LEVELS}/g,String(Ft.toFixed(1))),zh=Ah.replace(/\$\{MAX_NODES}/g,String(Ye)),Xh=Mh.replace(/\$\{MAX_NODES}/g,String(Ye)).replace(/\$\{MAX_ENV_MIP_LEVELS}/g,String(Ft.toFixed(1))),Wh=_h.replace(/\$\{MAX_NODES}/g,String(Ye)),Ei=He(),Ai=Fr(),Mi=He(),_i=Me(0,0,0),Di=Wf(0,0,0,1),Li=Me(1,1,1),wn=Fr(),Ls=or(),Rs=or(),pr=He(),Lt=He(),Fs=Fr(),$s=or(),rr=He(),Pn=He(),Vs=He(),Tn=He(),st=He(),yn=He(),qh=He(),ks=eo(),at=or(),Un=eo(),Yh=[["none",{color:{operation:"add",srcFactor:"one",dstFactor:"zero"},alpha:{operation:"add",srcFactor:"one",dstFactor:"zero"}},{depthWriteEnabled:!0,depthCompare:"less-equal",format:"depth24plus"}],["transparent",{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"},alpha:{operation:"add",srcFactor:"one",dstFactor:"one-minus-src-alpha"}},{depthWriteEnabled:!0,depthCompare:"less-equal",format:"depth24plus"}],["blend",{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"},alpha:{operation:"add",srcFactor:"one",dstFactor:"one-minus-src-alpha"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}],["additive",{color:{operation:"add",srcFactor:"src",dstFactor:"one"},alpha:{operation:"add",srcFactor:"src",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}],["addAlpha",{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one"},alpha:{operation:"add",srcFactor:"src-alpha",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}],["modulate",{color:{operation:"add",srcFactor:"zero",dstFactor:"src"},alpha:{operation:"add",srcFactor:"zero",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}],["modulate2x",{color:{operation:"add",srcFactor:"dst",dstFactor:"src"},alpha:{operation:"add",srcFactor:"zero",dstFactor:"one"}},{depthWriteEnabled:!1,depthCompare:"less-equal",format:"depth24plus"}]];class no{constructor(e){var r;this.gpuPipelines={},this.vertexBuffer=[],this.normalBuffer=[],this.vertices=[],this.texCoordBuffer=[],this.indexBuffer=[],this.wireframeIndexBuffer=[],this.wireframeIndexGPUBuffer=[],this.groupBuffer=[],this.skinWeightBuffer=[],this.tangentBuffer=[],this.gpuVertexBuffer=[],this.gpuNormalBuffer=[],this.gpuTexCoordBuffer=[],this.gpuGroupBuffer=[],this.gpuIndexBuffer=[],this.gpuSkinWeightBuffer=[],this.gpuTangentBuffer=[],this.gpuFSUniformsBuffers=[],this.isHD=(r=e.Geosets)==null?void 0:r.some(n=>{var i;return((i=n.SkinWeights)==null?void 0:i.length)>0}),this.shaderProgramLocations={vertexPositionAttribute:null,normalsAttribute:null,textureCoordAttribute:null,groupAttribute:null,skinAttribute:null,weightAttribute:null,tangentAttribute:null,pMatrixUniform:null,mvMatrixUniform:null,samplerUniform:null,normalSamplerUniform:null,ormSamplerUniform:null,replaceableColorUniform:null,replaceableTypeUniform:null,discardAlphaLevelUniform:null,tVertexAnimUniform:null,wireframeUniform:null,nodesMatricesAttributes:null,lightPosUniform:null,lightColorUniform:null,cameraPosUniform:null,shadowParamsUniform:null,shadowMapSamplerUniform:null,shadowMapLightMatrixUniform:null,hasEnvUniform:null,irradianceMapUniform:null,prefilteredEnvUniform:null,brdfLUTUniform:null},this.skeletonShaderProgramLocations={vertexPositionAttribute:null,colorAttribute:null,mvMatrixUniform:null,pMatrixUniform:null},this.model=e,this.rendererData={model:e,frame:0,animation:null,animationInfo:null,globalSequencesFrames:[],rootNode:null,nodes:[],geosetAnims:[],geosetAlpha:[],materialLayerTextureID:[],materialLayerNormalTextureID:[],materialLayerOrmTextureID:[],materialLayerReflectionTextureID:[],teamColor:null,cameraPos:null,cameraQuat:null,lightPos:null,lightColor:null,shadowBias:0,shadowSmoothingStep:0,textures:{},gpuTextures:{},gpuSamplers:[],gpuDepthSampler:null,gpuEmptyTexture:null,gpuEmptyCubeTexture:null,gpuDepthEmptyTexture:null,envTextures:{},gpuEnvTextures:{},requiredEnvMaps:{},irradianceMap:{},gpuIrradianceMap:{},prefilteredEnvMap:{},gpuPrefilteredEnvMap:{}},this.rendererData.teamColor=Me(1,0,0),this.rendererData.cameraPos=He(),this.rendererData.cameraQuat=Fr(),this.rendererData.lightPos=Me(1e3,1e3,1e3),this.rendererData.lightColor=Me(1,1,1),this.setSequence(0),this.rendererData.rootNode={node:{},matrix:or(),childs:[]};for(const n of e.Nodes)n&&(this.rendererData.nodes[n.ObjectId]={node:n,matrix:or(),childs:[]});for(const n of e.Nodes)n&&(!n.Parent&&n.Parent!==0?this.rendererData.rootNode.childs.push(this.rendererData.nodes[n.ObjectId]):this.rendererData.nodes[n.Parent].childs.push(this.rendererData.nodes[n.ObjectId]));if(e.GlobalSequences)for(let n=0;n<e.GlobalSequences.length;++n)this.rendererData.globalSequencesFrames[n]=0;for(let n=0;n<e.GeosetAnims.length;++n)this.rendererData.geosetAnims[e.GeosetAnims[n].GeosetId]=e.GeosetAnims[n];for(let n=0;n<e.Materials.length;++n)this.rendererData.materialLayerTextureID[n]=new Array(e.Materials[n].Layers.length),this.rendererData.materialLayerNormalTextureID[n]=new Array(e.Materials[n].Layers.length),this.rendererData.materialLayerOrmTextureID[n]=new Array(e.Materials[n].Layers.length),this.rendererData.materialLayerReflectionTextureID[n]=new Array(e.Materials[n].Layers.length);this.interp=new ro(this.rendererData),this.particlesController=new oh(this.interp,this.rendererData),this.ribbonsController=new ch(this.interp,this.rendererData)}destroy(){var e,r,n;if(this.particlesController&&(this.particlesController.destroy(),this.particlesController=null),this.ribbonsController&&(this.ribbonsController.destroy(),this.ribbonsController=null),this.device){for(const i of this.wireframeIndexGPUBuffer)i.destroy();(e=this.gpuMultisampleTexture)==null||e.destroy(),(r=this.gpuDepthTexture)==null||r.destroy();for(const i of this.gpuVertexBuffer)i.destroy();for(const i of this.gpuNormalBuffer)i.destroy();for(const i of this.gpuTexCoordBuffer)i.destroy();for(const i of this.gpuGroupBuffer)i.destroy();for(const i of this.gpuIndexBuffer)i.destroy();for(const i of this.gpuSkinWeightBuffer)i.destroy();for(const i of this.gpuTangentBuffer)i.destroy();(n=this.gpuVSUniformsBuffer)==null||n.destroy();for(const i in this.gpuFSUniformsBuffers)for(const o of this.gpuFSUniformsBuffers[i])o.destroy();this.skeletonGPUVertexBuffer&&(this.skeletonGPUVertexBuffer.destroy(),this.skeletonGPUVertexBuffer=null),this.skeletonGPUColorBuffer&&(this.skeletonGPUColorBuffer.destroy(),this.skeletonGPUColorBuffer=null),this.skeletonGPUUniformsBuffer&&(this.skeletonGPUUniformsBuffer.destroy(),this.skeletonGPUUniformsBuffer=null),this.envVSUniformsBuffer&&(this.envVSUniformsBuffer.destroy(),this.envVSUniformsBuffer=null),this.cubeGPUVertexBuffer&&(this.cubeGPUVertexBuffer.destroy(),this.cubeGPUVertexBuffer=null);for(const i of this.wireframeIndexGPUBuffer)i?.destroy()}this.gl&&(this.skeletonShaderProgram&&(this.skeletonVertexShader&&(this.gl.detachShader(this.skeletonShaderProgram,this.skeletonVertexShader),this.gl.deleteShader(this.skeletonVertexShader),this.skeletonVertexShader=null),this.skeletonFragmentShader&&(this.gl.detachShader(this.skeletonShaderProgram,this.skeletonFragmentShader),this.gl.deleteShader(this.skeletonFragmentShader),this.skeletonFragmentShader=null),this.gl.deleteProgram(this.skeletonShaderProgram),this.skeletonShaderProgram=null),this.shaderProgram&&(this.vertexShader&&(this.gl.detachShader(this.shaderProgram,this.vertexShader),this.gl.deleteShader(this.vertexShader),this.vertexShader=null),this.fragmentShader&&(this.gl.detachShader(this.shaderProgram,this.fragmentShader),this.gl.deleteShader(this.fragmentShader),this.fragmentShader=null),this.gl.deleteProgram(this.shaderProgram),this.shaderProgram=null),this.destroyShaderProgramObject(this.envToCubemap),this.destroyShaderProgramObject(this.envSphere),this.destroyShaderProgramObject(this.convoluteDiffuseEnv),this.destroyShaderProgramObject(this.prefilterEnv),this.destroyShaderProgramObject(this.integrateBRDF),this.gl.deleteBuffer(this.cubeVertexBuffer),this.gl.deleteBuffer(this.squareVertexBuffer))}initRequiredEnvMaps(){this.model.Version>=1e3&&(mt(this.gl)||this.device)&&this.model.Materials.forEach(e=>{let r;if(e.Shader==="Shader_HD_DefaultUnit"&&e.Layers.length===6&&typeof e.Layers[5].TextureID=="number"||this.model.Version>=1100&&(r=e.Layers.find(n=>n.ShaderTypeId===1&&n.ReflectionsTextureID))&&typeof r.ReflectionsTextureID=="number"){const n=this.model.Version>=1100&&r?r.ReflectionsTextureID:e.Layers[5].TextureID;this.rendererData.requiredEnvMaps[this.model.Textures[n].Image]=!0}})}initGL(e){this.gl=e,this.softwareSkinning=this.gl.getParameter(this.gl.MAX_VERTEX_UNIFORM_VECTORS)<4*(Ye+2),this.anisotropicExt=this.gl.getExtension("EXT_texture_filter_anisotropic")||this.gl.getExtension("MOZ_EXT_texture_filter_anisotropic")||this.gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),this.colorBufferFloatExt=this.gl.getExtension("EXT_color_buffer_float"),this.initRequiredEnvMaps(),this.initShaders(),this.initBuffers(),this.initCube(),this.initSquare(),this.initBRDFLUT(),this.particlesController.initGL(e),this.ribbonsController.initGL(e)}async initGPUDevice(e,r,n){this.canvas=e,this.device=r,this.gpuContext=n,this.initRequiredEnvMaps(),this.initGPUShaders(),this.initGPUPipeline(),this.initGPUBuffers(),this.initGPUUniformBuffers(),this.initGPUMultisampleTexture(),this.initGPUDepthTexture(),this.initGPUEmptyTexture(),this.initCube(),this.initGPUBRDFLUT(),this.particlesController.initGPUDevice(r),this.ribbonsController.initGPUDevice(r)}setTextureImage(e,r){var n;if(this.device){const i=this.rendererData.gpuTextures[e]=this.device.createTexture({size:[r.width,r.height],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});this.device.queue.copyExternalImageToTexture({source:r},{texture:i},{width:r.width,height:r.height}),Ds(this.device,i),this.processEnvMaps(e)}else{this.rendererData.textures[e]=this.gl.createTexture(),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[e]),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,r);const i=((n=this.model.Textures.find(o=>o.Image===e))==null?void 0:n.Flags)||0;this.setTextureParameters(i,!0),this.gl.generateMipmap(this.gl.TEXTURE_2D),this.processEnvMaps(e),this.gl.bindTexture(this.gl.TEXTURE_2D,null)}}setTextureImageData(e,r){var n;let i=1;for(let o=1;o<r.length&&!(r[o].width!==r[o-1].width/2||r[o].height!==r[o-1].height/2);++o,++i);if(this.device){const o=this.rendererData.gpuTextures[e]=this.device.createTexture({size:[r[0].width,r[0].height],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,mipLevelCount:i});for(let s=0;s<i;++s)this.device.queue.writeTexture({texture:o,mipLevel:s},r[s].data,{bytesPerRow:r[s].width*4},{width:r[s].width,height:r[s].height});this.processEnvMaps(e)}else{this.rendererData.textures[e]=this.gl.createTexture(),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[e]);for(let s=0;s<i;++s)this.gl.texImage2D(this.gl.TEXTURE_2D,s,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,r[s]);const o=((n=this.model.Textures.find(s=>s.Image===e))==null?void 0:n.Flags)||0;this.setTextureParameters(o,!1),this.processEnvMaps(e),this.gl.bindTexture(this.gl.TEXTURE_2D,null)}}setTextureCompressedImage(e,r,n,i){var o;this.rendererData.textures[e]=this.gl.createTexture(),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[e]);const s=new Uint8Array(n);let a=1;for(let u=1;u<i.images.length;++u){const l=i.images[u];l.shape.width>=2&&l.shape.height>=2&&(a=u+1)}if(mt(this.gl)){this.gl.texStorage2D(this.gl.TEXTURE_2D,a,r,i.images[0].shape.width,i.images[0].shape.height);for(let u=0;u<a;++u){const l=i.images[u];this.gl.compressedTexSubImage2D(this.gl.TEXTURE_2D,u,0,0,l.shape.width,l.shape.height,r,s.subarray(l.offset,l.offset+l.length))}}else for(let u=0;u<a;++u){const l=i.images[u];this.gl.compressedTexImage2D(this.gl.TEXTURE_2D,u,r,l.shape.width,l.shape.height,0,s.subarray(l.offset,l.offset+l.length))}const c=((o=this.model.Textures.find(u=>u.Image===e))==null?void 0:o.Flags)||0;this.setTextureParameters(c,mt(this.gl)),this.processEnvMaps(e),this.gl.bindTexture(this.gl.TEXTURE_2D,null)}setGPUTextureCompressedImage(e,r,n,i){const o=new Uint8Array(n);let s=1;for(let c=1;c<i.images.length;++c){const u=i.images[c];u.shape.width>=4&&u.shape.height>=4&&(s=c+1)}const a=this.rendererData.gpuTextures[e]=this.device.createTexture({size:[i.shape.width,i.shape.height],format:r,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,mipLevelCount:s});for(let c=0;c<s;++c){const u=i.images[c];this.device.queue.writeTexture({texture:a,mipLevel:c},o.subarray(u.offset,u.offset+u.length),{bytesPerRow:u.shape.width*(r==="bc1-rgba-unorm"?2:4)},{width:u.shape.width,height:u.shape.height})}this.processEnvMaps(e)}setCamera(e,r){zr(this.rendererData.cameraPos,e),qf(this.rendererData.cameraQuat,r)}setLightPosition(e){zr(this.rendererData.lightPos,e)}setLightColor(e){zr(this.rendererData.lightColor,e)}setSequence(e){this.rendererData.animation=e,this.rendererData.animationInfo=this.model.Sequences[this.rendererData.animation],this.rendererData.frame=this.rendererData.animationInfo.Interval[0]}getSequence(){return this.rendererData.animation}setFrame(e){const r=this.model.Sequences.findIndex(n=>n.Interval[0]<=e&&n.Interval[1]>=e);r<0||(this.rendererData.animation=r,this.rendererData.animationInfo=this.model.Sequences[this.rendererData.animation],this.rendererData.frame=e)}getFrame(){return this.rendererData.frame}setTeamColor(e){zr(this.rendererData.teamColor,e)}update(e){this.rendererData.frame+=e,this.rendererData.frame>this.rendererData.animationInfo.Interval[1]&&(this.rendererData.frame=this.rendererData.animationInfo.Interval[0]),this.updateGlobalSequences(e),this.updateNode(this.rendererData.rootNode),this.particlesController.update(e),this.ribbonsController.update(e);for(let r=0;r<this.model.Geosets.length;++r)this.rendererData.geosetAlpha[r]=this.findAlpha(r);for(let r=0;r<this.rendererData.materialLayerTextureID.length;++r)for(let n=0;n<this.rendererData.materialLayerTextureID[r].length;++n){const i=this.model.Materials[r].Layers[n],o=i.TextureID,s=i.NormalTextureID,a=i.ORMTextureID,c=i.ReflectionsTextureID;typeof o=="number"?this.rendererData.materialLayerTextureID[r][n]=o:this.rendererData.materialLayerTextureID[r][n]=this.interp.num(o),typeof s<"u"&&(this.rendererData.materialLayerNormalTextureID[r][n]=typeof s=="number"?s:this.interp.num(s)),typeof a<"u"&&(this.rendererData.materialLayerOrmTextureID[r][n]=typeof a=="number"?a:this.interp.num(a)),typeof c<"u"&&(this.rendererData.materialLayerReflectionTextureID[r][n]=typeof c=="number"?c:this.interp.num(c))}}render(e,r,{wireframe:n,env:i,levelOfDetail:o=0,useEnvironmentMap:s=!1,shadowMapTexture:a,shadowMapMatrix:c,shadowBias:u,shadowSmoothingStep:l,depthTextureTarget:d}){var g,f,h,v,S;if(!(d&&!this.isHD)){if(this.device){(this.gpuMultisampleTexture.width!==this.canvas.width||this.gpuMultisampleTexture.height!==this.canvas.height)&&(this.gpuMultisampleTexture.destroy(),this.initGPUMultisampleTexture()),(this.gpuDepthTexture.width!==this.canvas.width||this.gpuDepthTexture.height!==this.canvas.height)&&(this.gpuDepthTexture.destroy(),this.initGPUDepthTexture());let p;d?p={label:"shadow renderPass",colorAttachments:[],depthStencilAttachment:{view:d.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}}:(p=this.gpuRenderPassDescriptor,this.gpuRenderPassDescriptor.colorAttachments[0].view=this.gpuMultisampleTexture.createView(),this.gpuRenderPassDescriptor.colorAttachments[0].resolveTarget=this.gpuContext.getCurrentTexture().createView(),this.gpuRenderPassDescriptor.depthStencilAttachment={view:this.gpuDepthTexture.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"});const w=this.device.createCommandEncoder(),m=w.beginRenderPass(p);i&&this.renderEnvironmentGPU(m,e,r);const U=new ArrayBuffer(128+64*Ye),x={mvMatrix:new Float32Array(U,0,16),pMatrix:new Float32Array(U,64,16),nodesMatrices:new Float32Array(U,128,16*Ye)};x.mvMatrix.set(e),x.pMatrix.set(r);for(let y=0;y<Ye;++y)this.rendererData.nodes[y]&&x.nodesMatrices.set(this.rendererData.nodes[y].matrix,y*16);this.device.queue.writeBuffer(this.gpuVSUniformsBuffer,0,U);for(let y=0;y<this.model.Geosets.length;++y){const T=this.model.Geosets[y];if(this.rendererData.geosetAlpha[y]<1e-6||T.LevelOfDetail!==void 0&&T.LevelOfDetail!==o)continue;n&&!this.wireframeIndexGPUBuffer[y]&&this.createWireframeGPUBuffer(y);const P=T.MaterialID,k=this.model.Materials[P];if(m.setVertexBuffer(0,this.gpuVertexBuffer[y]),m.setVertexBuffer(1,this.gpuNormalBuffer[y]),m.setVertexBuffer(2,this.gpuTexCoordBuffer[y]),this.isHD?(m.setVertexBuffer(3,this.gpuTangentBuffer[y]),m.setVertexBuffer(4,this.gpuSkinWeightBuffer[y]),m.setVertexBuffer(5,this.gpuSkinWeightBuffer[y])):m.setVertexBuffer(3,this.gpuGroupBuffer[y]),m.setIndexBuffer(n?this.wireframeIndexGPUBuffer[y]:this.gpuIndexBuffer[y],"uint16"),this.isHD){const L=k.Layers[0];if(d&&!Ih.has(L.FilterMode||0))continue;const N=d?this.gpuShadowPipeline:n?this.gpuWireframePipeline:this.getGPUPipeline(L);m.setPipeline(N);const D=this.rendererData.materialLayerTextureID[P],V=this.rendererData.materialLayerNormalTextureID[P],$=this.rendererData.materialLayerOrmTextureID[P],I=this.rendererData.materialLayerReflectionTextureID[P],pe=D[0],K=this.model.Textures[pe],Te=L?.ShaderTypeId===1?V[0]:D[1],Ie=this.model.Textures[Te],Le=L?.ShaderTypeId===1?$[0]:D[2],Oe=this.model.Textures[Le],Fe=L?.ShaderTypeId===1?I[0]:D[5],ze=this.model.Textures[Fe],Xe=ze?.Image,ct=this.rendererData.gpuIrradianceMap[Xe],Ze=this.rendererData.gpuPrefilteredEnvMap[Xe],ht=i&&ct&&Ze;(g=this.gpuFSUniformsBuffers)[P]||(g[P]=[]);let qe=this.gpuFSUniformsBuffers[P][0];qe||(qe=this.gpuFSUniformsBuffers[P][0]=this.device.createBuffer({label:`fs uniforms ${P}`,size:192,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}));const je=this.getTexCoordMatrix(L),$e=new ArrayBuffer(192),Ge={replaceableColor:new Float32Array($e,0,3),discardAlphaLevel:new Float32Array($e,12,1),tVertexAnim:new Float32Array($e,16,12),lightPos:new Float32Array($e,64,3),hasEnv:new Uint32Array($e,76,1),lightColor:new Float32Array($e,80,3),wireframe:new Uint32Array($e,92,1),cameraPos:new Float32Array($e,96,3),shadowParams:new Float32Array($e,112,3),shadowMapLightMatrix:new Float32Array($e,128,16)};Ge.replaceableColor.set(this.rendererData.teamColor),Ge.discardAlphaLevel.set([L.FilterMode===Re.Transparent?.75:0]),Ge.tVertexAnim.set(je.slice(0,3)),Ge.tVertexAnim.set(je.slice(3,6),4),Ge.tVertexAnim.set(je.slice(6,9),8),Ge.lightPos.set(this.rendererData.lightPos),Ge.lightColor.set(this.rendererData.lightColor),Ge.cameraPos.set(this.rendererData.cameraPos),a&&c?(Ge.shadowParams.set([1,u??1e-6,l??1/1024]),Ge.shadowMapLightMatrix.set(c)):(Ge.shadowParams.set([0,0,0]),Ge.shadowMapLightMatrix.set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])),Ge.hasEnv.set([ht?1:0]),Ge.wireframe.set([n?1:0]),this.device.queue.writeBuffer(qe,0,$e);const St=this.device.createBindGroup({label:`fs uniforms ${P}`,layout:this.fsBindGroupLayout,entries:[{binding:0,resource:{buffer:qe}},{binding:1,resource:this.rendererData.gpuSamplers[pe]},{binding:2,resource:(this.rendererData.gpuTextures[K.Image]||this.rendererData.gpuEmptyTexture).createView()},{binding:3,resource:this.rendererData.gpuSamplers[Te]},{binding:4,resource:(this.rendererData.gpuTextures[Ie.Image]||this.rendererData.gpuEmptyTexture).createView()},{binding:5,resource:this.rendererData.gpuSamplers[Le]},{binding:6,resource:(this.rendererData.gpuTextures[Oe.Image]||this.rendererData.gpuEmptyTexture).createView()},{binding:7,resource:this.rendererData.gpuDepthSampler},{binding:8,resource:(a||this.rendererData.gpuDepthEmptyTexture).createView()},{binding:9,resource:this.prefilterEnvSampler},{binding:10,resource:(ct||this.rendererData.gpuEmptyCubeTexture).createView({dimension:"cube"})},{binding:11,resource:this.prefilterEnvSampler},{binding:12,resource:(Ze||this.rendererData.gpuEmptyCubeTexture).createView({dimension:"cube"})},{binding:13,resource:this.gpuBrdfSampler},{binding:14,resource:this.gpuBrdfLUT.createView()}]});m.setBindGroup(0,this.gpuVSUniformsBindGroup),m.setBindGroup(1,St),m.drawIndexed(n?T.Faces.length*2:T.Faces.length)}else for(let L=0;L<k.Layers.length;++L){const N=k.Layers[L],D=this.rendererData.materialLayerTextureID[P][L],V=this.model.Textures[D],$=n?this.gpuWireframePipeline:this.getGPUPipeline(N);m.setPipeline($),(f=this.gpuFSUniformsBuffers)[P]||(f[P]=[]);let I=this.gpuFSUniformsBuffers[P][L];I||(I=this.gpuFSUniformsBuffers[P][L]=this.device.createBuffer({label:`fs uniforms ${P} ${L}`,size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}));const pe=this.getTexCoordMatrix(N),K=new ArrayBuffer(80),Te={replaceableColor:new Float32Array(K,0,3),replaceableType:new Uint32Array(K,12,1),discardAlphaLevel:new Float32Array(K,16,1),wireframe:new Uint32Array(K,20,1),tVertexAnim:new Float32Array(K,32,12)};Te.replaceableColor.set(this.rendererData.teamColor),Te.replaceableType.set([V.ReplaceableId||0]),Te.discardAlphaLevel.set([N.FilterMode===Re.Transparent?.75:0]),Te.tVertexAnim.set(pe.slice(0,3)),Te.tVertexAnim.set(pe.slice(3,6),4),Te.tVertexAnim.set(pe.slice(6,9),8),Te.wireframe.set([n?1:0]),this.device.queue.writeBuffer(I,0,K);const Ie=this.device.createBindGroup({label:`fs uniforms ${P} ${L}`,layout:this.fsBindGroupLayout,entries:[{binding:0,resource:{buffer:I}},{binding:1,resource:this.rendererData.gpuSamplers[D]},{binding:2,resource:(this.rendererData.gpuTextures[V.Image]||this.rendererData.gpuEmptyTexture).createView()}]});m.setBindGroup(0,this.gpuVSUniformsBindGroup),m.setBindGroup(1,Ie),m.drawIndexed(n?T.Faces.length*2:T.Faces.length)}}this.particlesController.renderGPU(m,e,r),this.ribbonsController.renderGPU(m,e,r),m.end();const b=w.finish();this.device.queue.submit([b]);return}if(i&&this.renderEnvironment(e,r),this.gl.useProgram(this.shaderProgram),this.gl.uniformMatrix4fv(this.shaderProgramLocations.pMatrixUniform,!1,r),this.gl.uniformMatrix4fv(this.shaderProgramLocations.mvMatrixUniform,!1,e),this.gl.uniform1f(this.shaderProgramLocations.wireframeUniform,n?1:0),this.gl.enableVertexAttribArray(this.shaderProgramLocations.vertexPositionAttribute),this.gl.enableVertexAttribArray(this.shaderProgramLocations.normalsAttribute),this.gl.enableVertexAttribArray(this.shaderProgramLocations.textureCoordAttribute),this.isHD?(this.gl.enableVertexAttribArray(this.shaderProgramLocations.skinAttribute),this.gl.enableVertexAttribArray(this.shaderProgramLocations.weightAttribute),this.gl.enableVertexAttribArray(this.shaderProgramLocations.tangentAttribute)):this.softwareSkinning||this.gl.enableVertexAttribArray(this.shaderProgramLocations.groupAttribute),!this.softwareSkinning)for(let p=0;p<Ye;++p)this.rendererData.nodes[p]&&this.gl.uniformMatrix4fv(this.shaderProgramLocations.nodesMatricesAttributes[p],!1,this.rendererData.nodes[p].matrix);for(let p=0;p<this.model.Geosets.length;++p){const w=this.model.Geosets[p];if(this.rendererData.geosetAlpha[p]<1e-6||w.LevelOfDetail!==void 0&&w.LevelOfDetail!==o)continue;this.softwareSkinning&&this.generateGeosetVertices(p);const m=w.MaterialID,U=this.model.Materials[m];if(this.isHD){this.gl.uniform3fv(this.shaderProgramLocations.lightPosUniform,this.rendererData.lightPos),this.gl.uniform3fv(this.shaderProgramLocations.lightColorUniform,this.rendererData.lightColor),this.gl.uniform3fv(this.shaderProgramLocations.cameraPosUniform,this.rendererData.cameraPos),a&&c?(this.gl.uniform3f(this.shaderProgramLocations.shadowParamsUniform,1,u??1e-6,l??1/1024),this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,a),this.gl.uniform1i(this.shaderProgramLocations.shadowMapSamplerUniform,3),this.gl.uniformMatrix4fv(this.shaderProgramLocations.shadowMapLightMatrixUniform,!1,c)):this.gl.uniform3f(this.shaderProgramLocations.shadowParamsUniform,0,0,0);const x=this.model.Version>=1100&&((h=U.Layers.find(P=>P.ShaderTypeId===1&&typeof P.ReflectionsTextureID=="number"))==null?void 0:h.ReflectionsTextureID)||((v=U.Layers[5])==null?void 0:v.TextureID),b=(S=this.model.Textures[x])==null?void 0:S.Image,y=this.rendererData.irradianceMap[b],T=this.rendererData.prefilteredEnvMap[b];s&&y&&T?(this.gl.uniform1i(this.shaderProgramLocations.hasEnvUniform,1),this.gl.activeTexture(this.gl.TEXTURE4),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,y),this.gl.uniform1i(this.shaderProgramLocations.irradianceMapUniform,4),this.gl.activeTexture(this.gl.TEXTURE5),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,T),this.gl.uniform1i(this.shaderProgramLocations.prefilteredEnvUniform,5),this.gl.activeTexture(this.gl.TEXTURE6),this.gl.bindTexture(this.gl.TEXTURE_2D,this.brdfLUT),this.gl.uniform1i(this.shaderProgramLocations.brdfLUTUniform,6)):(this.gl.uniform1i(this.shaderProgramLocations.hasEnvUniform,0),this.gl.uniform1i(this.shaderProgramLocations.irradianceMapUniform,4),this.gl.uniform1i(this.shaderProgramLocations.prefilteredEnvUniform,5),this.gl.uniform1i(this.shaderProgramLocations.brdfLUTUniform,6)),this.setLayerPropsHD(m,U.Layers),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer[p]),this.gl.vertexAttribPointer(this.shaderProgramLocations.vertexPositionAttribute,3,this.gl.FLOAT,!1,0,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.normalBuffer[p]),this.gl.vertexAttribPointer(this.shaderProgramLocations.normalsAttribute,3,this.gl.FLOAT,!1,0,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.texCoordBuffer[p]),this.gl.vertexAttribPointer(this.shaderProgramLocations.textureCoordAttribute,2,this.gl.FLOAT,!1,0,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.skinWeightBuffer[p]),this.gl.vertexAttribPointer(this.shaderProgramLocations.skinAttribute,4,this.gl.UNSIGNED_BYTE,!1,8,0),this.gl.vertexAttribPointer(this.shaderProgramLocations.weightAttribute,4,this.gl.UNSIGNED_BYTE,!0,8,4),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.tangentBuffer[p]),this.gl.vertexAttribPointer(this.shaderProgramLocations.tangentAttribute,4,this.gl.FLOAT,!1,0,0),n&&!this.wireframeIndexBuffer[p]&&this.createWireframeBuffer(p),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,n?this.wireframeIndexBuffer[p]:this.indexBuffer[p]),this.gl.drawElements(n?this.gl.LINES:this.gl.TRIANGLES,n?w.Faces.length*2:w.Faces.length,this.gl.UNSIGNED_SHORT,0),a&&c&&(this.gl.activeTexture(this.gl.TEXTURE3),this.gl.bindTexture(this.gl.TEXTURE_2D,null))}else for(let x=0;x<U.Layers.length;++x)this.setLayerProps(U.Layers[x],this.rendererData.materialLayerTextureID[m][x]),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer[p]),this.gl.vertexAttribPointer(this.shaderProgramLocations.vertexPositionAttribute,3,this.gl.FLOAT,!1,0,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.normalBuffer[p]),this.gl.vertexAttribPointer(this.shaderProgramLocations.normalsAttribute,3,this.gl.FLOAT,!1,0,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.texCoordBuffer[p]),this.gl.vertexAttribPointer(this.shaderProgramLocations.textureCoordAttribute,2,this.gl.FLOAT,!1,0,0),this.softwareSkinning||(this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.groupBuffer[p]),this.gl.vertexAttribPointer(this.shaderProgramLocations.groupAttribute,4,this.gl.UNSIGNED_SHORT,!1,0,0)),n&&!this.wireframeIndexBuffer[p]&&this.createWireframeBuffer(p),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,n?this.wireframeIndexBuffer[p]:this.indexBuffer[p]),this.gl.drawElements(n?this.gl.LINES:this.gl.TRIANGLES,n?w.Faces.length*2:w.Faces.length,this.gl.UNSIGNED_SHORT,0)}this.gl.disableVertexAttribArray(this.shaderProgramLocations.vertexPositionAttribute),this.gl.disableVertexAttribArray(this.shaderProgramLocations.normalsAttribute),this.gl.disableVertexAttribArray(this.shaderProgramLocations.textureCoordAttribute),this.isHD?(this.gl.disableVertexAttribArray(this.shaderProgramLocations.skinAttribute),this.gl.disableVertexAttribArray(this.shaderProgramLocations.weightAttribute),this.gl.disableVertexAttribArray(this.shaderProgramLocations.tangentAttribute)):this.softwareSkinning||this.gl.disableVertexAttribArray(this.shaderProgramLocations.groupAttribute),this.particlesController.render(e,r),this.ribbonsController.render(e,r)}}renderEnvironmentGPU(e,r,n){e.setPipeline(this.envPiepeline);const i=new ArrayBuffer(128),o={mvMatrix:new Float32Array(i,0,16),pMatrix:new Float32Array(i,64,16)};o.mvMatrix.set(r),o.pMatrix.set(n),this.device.queue.writeBuffer(this.envVSUniformsBuffer,0,i),e.setBindGroup(0,this.envVSBindGroup);for(const s in this.rendererData.gpuEnvTextures){const a=this.device.createBindGroup({label:`env fs uniforms ${s}`,layout:this.envFSBindGroupLayout,entries:[{binding:0,resource:this.envSampler},{binding:1,resource:this.rendererData.gpuEnvTextures[s].createView({dimension:"cube"})}]});e.setBindGroup(1,a),e.setPipeline(this.envPiepeline),e.setVertexBuffer(0,this.cubeGPUVertexBuffer),e.draw(36)}}renderEnvironment(e,r){if(mt(this.gl)){this.gl.disable(this.gl.BLEND),this.gl.disable(this.gl.DEPTH_TEST),this.gl.disable(this.gl.CULL_FACE);for(const n in this.rendererData.envTextures)this.gl.useProgram(this.envSphere.program),this.gl.uniformMatrix4fv(this.envSphere.uniforms.uPMatrix,!1,r),this.gl.uniformMatrix4fv(this.envSphere.uniforms.uMVMatrix,!1,e),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,this.rendererData.envTextures[n]),this.gl.uniform1i(this.envSphere.uniforms.uEnvironmentMap,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.cubeVertexBuffer),this.gl.enableVertexAttribArray(this.envSphere.attributes.aPos),this.gl.vertexAttribPointer(this.envSphere.attributes.aPos,3,this.gl.FLOAT,!1,0,0),this.gl.drawArrays(this.gl.TRIANGLES,0,36),this.gl.disableVertexAttribArray(this.envSphere.attributes.aPos),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,null)}}renderSkeleton(e,r,n){var i,o,s;const a=[],c=[],u=(f,h)=>{yt(st,f.node.PivotPoint,f.matrix),a.push(st[0],st[1],st[2]),yt(st,h.node.PivotPoint,h.matrix),a.push(st[0],st[1],st[2]),c.push(0,1,0,0,0,1)},l=f=>{(f.node.Parent||f.node.Parent===0)&&(!n||n.includes(f.node.Name))&&u(f,this.rendererData.nodes[f.node.Parent]);for(const h of f.childs)l(h)};if(l(this.rendererData.rootNode),!a.length)return;const d=new Float32Array(a),g=new Float32Array(c);if(this.device){this.skeletonShaderModule||(this.skeletonShaderModule=this.device.createShaderModule({label:"skeleton",code:Dh})),this.skeletonBindGroupLayout||(this.skeletonBindGroupLayout=this.device.createBindGroupLayout({label:"skeleton bind group layout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform",hasDynamicOffset:!1,minBindingSize:128}}]})),this.skeletonPipelineLayout||(this.skeletonPipelineLayout=this.device.createPipelineLayout({label:"skeleton pipeline layout",bindGroupLayouts:[this.skeletonBindGroupLayout]})),this.skeletonPipeline||(this.skeletonPipeline=this.device.createRenderPipeline({label:"skeleton pipeline",layout:this.skeletonPipelineLayout,vertex:{module:this.skeletonShaderModule,buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]},{arrayStride:12,attributes:[{shaderLocation:1,offset:0,format:"float32x3"}]}]},fragment:{module:this.skeletonShaderModule,targets:[{format:navigator.gpu.getPreferredCanvasFormat(),blend:{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"},alpha:{operation:"add",srcFactor:"one",dstFactor:"one-minus-src-alpha"}}}]},primitive:{topology:"line-list"}})),(i=this.skeletonGPUVertexBuffer)==null||i.destroy(),(o=this.skeletonGPUColorBuffer)==null||o.destroy(),(s=this.skeletonGPUUniformsBuffer)==null||s.destroy();const f=this.skeletonGPUVertexBuffer=this.device.createBuffer({label:"skeleton vertex",size:d.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0});new Float32Array(f.getMappedRange(0,f.size)).set(d),f.unmap();const h=this.skeletonGPUColorBuffer=this.device.createBuffer({label:"skeleton color",size:g.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0});new Float32Array(h.getMappedRange(0,h.size)).set(g),h.unmap();const v=this.skeletonGPUUniformsBuffer=this.device.createBuffer({label:"skeleton vs uniforms",size:128,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),S=this.device.createBindGroup({label:"skeleton uniforms bind group",layout:this.skeletonBindGroupLayout,entries:[{binding:0,resource:{buffer:v}}]}),p={label:"skeleton renderPass",colorAttachments:[{view:this.gpuContext.getCurrentTexture().createView(),clearValue:[.15,.15,.15,1],loadOp:"load",storeOp:"store"}]},w=this.device.createCommandEncoder(),m=w.beginRenderPass(p),U=new ArrayBuffer(128),x={mvMatrix:new Float32Array(U,0,16),pMatrix:new Float32Array(U,64,16)};x.mvMatrix.set(e),x.pMatrix.set(r),this.device.queue.writeBuffer(v,0,U),m.setVertexBuffer(0,f),m.setVertexBuffer(1,h),m.setPipeline(this.skeletonPipeline),m.setBindGroup(0,S),m.draw(d.length/3),m.end();const b=w.finish();this.device.queue.submit([b]);return}this.skeletonShaderProgram||(this.skeletonShaderProgram=this.initSkeletonShaderProgram()),this.gl.disable(this.gl.BLEND),this.gl.disable(this.gl.DEPTH_TEST),this.gl.useProgram(this.skeletonShaderProgram),this.gl.uniformMatrix4fv(this.skeletonShaderProgramLocations.pMatrixUniform,!1,r),this.gl.uniformMatrix4fv(this.skeletonShaderProgramLocations.mvMatrixUniform,!1,e),this.gl.enableVertexAttribArray(this.skeletonShaderProgramLocations.vertexPositionAttribute),this.gl.enableVertexAttribArray(this.skeletonShaderProgramLocations.colorAttribute),this.skeletonVertexBuffer||(this.skeletonVertexBuffer=this.gl.createBuffer()),this.skeletonColorBuffer||(this.skeletonColorBuffer=this.gl.createBuffer()),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.skeletonVertexBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,d,this.gl.DYNAMIC_DRAW),this.gl.vertexAttribPointer(this.skeletonShaderProgramLocations.vertexPositionAttribute,3,this.gl.FLOAT,!1,0,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.skeletonColorBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,g,this.gl.DYNAMIC_DRAW),this.gl.vertexAttribPointer(this.skeletonShaderProgramLocations.colorAttribute,3,this.gl.FLOAT,!1,0,0),this.gl.drawArrays(this.gl.LINES,0,d.length/3),this.gl.disableVertexAttribArray(this.skeletonShaderProgramLocations.vertexPositionAttribute),this.gl.disableVertexAttribArray(this.skeletonShaderProgramLocations.colorAttribute)}initSkeletonShaderProgram(){const e=this.skeletonVertexShader=$t(this.gl,vh,this.gl.VERTEX_SHADER),r=this.skeletonFragmentShader=$t(this.gl,bh,this.gl.FRAGMENT_SHADER),n=this.gl.createProgram();return this.gl.attachShader(n,e),this.gl.attachShader(n,r),this.gl.linkProgram(n),this.gl.getProgramParameter(n,this.gl.LINK_STATUS)||alert("Could not initialise shaders"),this.gl.useProgram(n),this.skeletonShaderProgramLocations.vertexPositionAttribute=this.gl.getAttribLocation(n,"aVertexPosition"),this.skeletonShaderProgramLocations.colorAttribute=this.gl.getAttribLocation(n,"aColor"),this.skeletonShaderProgramLocations.pMatrixUniform=this.gl.getUniformLocation(n,"uPMatrix"),this.skeletonShaderProgramLocations.mvMatrixUniform=this.gl.getUniformLocation(n,"uMVMatrix"),n}generateGeosetVertices(e){const r=this.model.Geosets[e],n=this.vertices[e];for(let i=0;i<n.length;i+=3){const o=i/3,s=r.Groups[r.VertexGroup[o]];dt(st,r.Vertices[i],r.Vertices[i+1],r.Vertices[i+2]),dt(yn,0,0,0);for(let a=0;a<s.length;++a)Cs(yn,yn,yt(qh,st,this.rendererData.nodes[s[a]].matrix));ll(st,yn,1/s.length),n[i]=st[0],n[i+1]=st[1],n[i+2]=st[2]}this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer[e]),this.gl.bufferData(this.gl.ARRAY_BUFFER,n,this.gl.DYNAMIC_DRAW)}setTextureParameters(e,r){if(e&Qr.WrapWidth?this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.REPEAT):this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),e&Qr.WrapHeight?this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.REPEAT):this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,r?this.gl.LINEAR_MIPMAP_NEAREST:this.gl.LINEAR),this.anisotropicExt){const n=this.gl.getParameter(this.anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);this.gl.texParameterf(this.gl.TEXTURE_2D,this.anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT,n)}}processEnvMaps(e){if(!this.rendererData.requiredEnvMaps[e]||!(this.rendererData.textures[e]||this.rendererData.gpuTextures[e])||!(mt(this.gl)||this.device)||!(this.colorBufferFloatExt||this.device))return;this.gl&&(this.gl.disable(this.gl.BLEND),this.gl.disable(this.gl.DEPTH_TEST),this.gl.disable(this.gl.CULL_FACE));const r=or(),n=or(),i=Me(0,0,0);let o,s;this.device?(o=[Me(1,0,0),Me(-1,0,0),Me(0,-1,0),Me(0,1,0),Me(0,0,1),Me(0,0,-1)],s=[Me(0,-1,0),Me(0,-1,0),Me(0,0,-1),Me(0,0,1),Me(0,-1,0),Me(0,-1,0)]):(o=[Me(1,0,0),Me(-1,0,0),Me(0,1,0),Me(0,-1,0),Me(0,0,1),Me(0,0,-1)],s=[Me(0,-1,0),Me(0,-1,0),Me(0,0,1),Me(0,0,-1),Me(0,-1,0),Me(0,-1,0)]),Af(r,Math.PI/2,1,.1,10);let a,c,u;if(this.device){u=this.rendererData.gpuEnvTextures[e]=this.device.createTexture({label:`env cubemap ${e}`,size:[Er,Er,6],format:navigator.gpu.getPreferredCanvasFormat(),usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING,mipLevelCount:Ft});const l=this.device.createCommandEncoder({label:"env to cubemap"}),d=[];for(let f=0;f<6;++f){Cr(n,i,o[f],s[f]);const h=l.beginRenderPass({label:"env to cubemap",colorAttachments:[{view:u.createView({dimension:"2d",baseArrayLayer:f,baseMipLevel:0,mipLevelCount:1}),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]}),v=new ArrayBuffer(128),S={mvMatrix:new Float32Array(v,0,16),pMatrix:new Float32Array(v,64,16)};S.mvMatrix.set(n),S.pMatrix.set(r);const p=this.device.createBuffer({label:`env to cubemap vs uniforms ${f}`,size:128,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});d.push(p),this.device.queue.writeBuffer(p,0,v);const w=this.device.createBindGroup({label:`env to cubemap vs bind group ${f}`,layout:this.envToCubemapVSBindGroupLayout,entries:[{binding:0,resource:{buffer:p}}]});h.setBindGroup(0,w);const m=this.device.createBindGroup({label:`env to cubemap fs uniforms ${f}`,layout:this.envToCubemapFSBindGroupLayout,entries:[{binding:0,resource:this.envToCubemapSampler},{binding:1,resource:this.rendererData.gpuTextures[e].createView()}]});h.setBindGroup(1,m),h.setPipeline(this.envToCubemapPiepeline),h.setVertexBuffer(0,this.cubeGPUVertexBuffer),h.draw(36),h.end()}const g=l.finish();this.device.queue.submit([g]),this.device.queue.onSubmittedWorkDone().finally(()=>{d.forEach(f=>{f.destroy()})})}else if(mt(this.gl)){a=this.gl.createFramebuffer(),this.gl.useProgram(this.envToCubemap.program),c=this.rendererData.envTextures[e]=this.gl.createTexture(),this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,c);for(let l=0;l<6;++l)this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+l,0,this.gl.RGBA16F,Er,Er,0,this.gl.RGBA,this.gl.FLOAT,null);this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_WRAP_R,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.cubeVertexBuffer),this.gl.enableVertexAttribArray(this.envToCubemap.attributes.aPos),this.gl.vertexAttribPointer(this.envToCubemap.attributes.aPos,3,this.gl.FLOAT,!1,0,0),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.uniformMatrix4fv(this.envToCubemap.uniforms.uPMatrix,!1,r),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[e]),this.gl.uniform1i(this.envToCubemap.uniforms.uEquirectangularMap,0),this.gl.viewport(0,0,Er,Er);for(let l=0;l<6;++l)this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+l,c,0),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),Cr(n,i,o[l],s[l]),this.gl.uniformMatrix4fv(this.envToCubemap.uniforms.uMVMatrix,!1,n),this.gl.drawArrays(this.gl.TRIANGLES,0,36);this.gl.disableVertexAttribArray(this.envToCubemap.attributes.aPos),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null)}if(this.device?Ds(this.device,u):(this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,c),this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,null)),this.device){u=this.rendererData.gpuIrradianceMap[e]=this.device.createTexture({label:`convolute diffuse ${e}`,size:[Ar,Ar,6],format:navigator.gpu.getPreferredCanvasFormat(),usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING,mipLevelCount:5});const l=this.device.createCommandEncoder({label:"convolute diffuse"}),d=[];for(let f=0;f<6;++f){Cr(n,i,o[f],s[f]);const h=l.beginRenderPass({label:"convolute diffuse",colorAttachments:[{view:u.createView({dimension:"2d",baseArrayLayer:f,baseMipLevel:0,mipLevelCount:1}),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]}),v=new ArrayBuffer(128),S={mvMatrix:new Float32Array(v,0,16),pMatrix:new Float32Array(v,64,16)};S.mvMatrix.set(n),S.pMatrix.set(r);const p=this.device.createBuffer({label:`convolute diffuse vs uniforms ${f}`,size:128,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});d.push(p),this.device.queue.writeBuffer(p,0,v);const w=this.device.createBindGroup({label:`convolute diffuse vs bind group ${f}`,layout:this.convoluteDiffuseEnvVSBindGroupLayout,entries:[{binding:0,resource:{buffer:p}}]});h.setBindGroup(0,w);const m=this.device.createBindGroup({label:`convolute diffuse fs uniforms ${f}`,layout:this.convoluteDiffuseEnvFSBindGroupLayout,entries:[{binding:0,resource:this.convoluteDiffuseEnvSampler},{binding:1,resource:this.rendererData.gpuEnvTextures[e].createView({dimension:"cube"})}]});h.setBindGroup(1,m),h.setPipeline(this.convoluteDiffuseEnvPiepeline),h.setVertexBuffer(0,this.cubeGPUVertexBuffer),h.draw(36),h.end()}const g=l.finish();this.device.queue.submit([g]),this.device.queue.onSubmittedWorkDone().finally(()=>{d.forEach(f=>{f.destroy()})})}else if(mt(this.gl)){this.gl.useProgram(this.convoluteDiffuseEnv.program);const l=this.rendererData.irradianceMap[e]=this.gl.createTexture();this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,l);for(let d=0;d<6;++d)this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+d,0,this.gl.RGBA16F,Ar,Ar,0,this.gl.RGBA,this.gl.FLOAT,null);this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_WRAP_R,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.cubeVertexBuffer),this.gl.enableVertexAttribArray(this.convoluteDiffuseEnv.attributes.aPos),this.gl.vertexAttribPointer(this.convoluteDiffuseEnv.attributes.aPos,3,this.gl.FLOAT,!1,0,0),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.uniformMatrix4fv(this.convoluteDiffuseEnv.uniforms.uPMatrix,!1,r),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,this.rendererData.envTextures[e]),this.gl.uniform1i(this.convoluteDiffuseEnv.uniforms.uEnvironmentMap,0),this.gl.viewport(0,0,Ar,Ar);for(let d=0;d<6;++d)this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+d,l,0),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),Cr(n,i,o[d],s[d]),this.gl.uniformMatrix4fv(this.convoluteDiffuseEnv.uniforms.uMVMatrix,!1,n),this.gl.drawArrays(this.gl.TRIANGLES,0,36);this.gl.disableVertexAttribArray(this.convoluteDiffuseEnv.attributes.aPos),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,l),this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP)}if(this.device){const l=this.rendererData.gpuPrefilteredEnvMap[e]=this.device.createTexture({label:`prefilter env ${e}`,size:[mr,mr,6],format:navigator.gpu.getPreferredCanvasFormat(),usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING,mipLevelCount:Ft}),d=this.device.createCommandEncoder({label:"prefilter env"}),g=[];for(let h=0;h<Ft;++h){const v=new ArrayBuffer(4),S={roughness:new Float32Array(v)},p=h/(Ft-1);S.roughness.set([p]);const w=this.device.createBuffer({label:`prefilter env fs uniforms ${h}`,size:4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});g.push(w),this.device.queue.writeBuffer(w,0,v);const m=this.device.createBindGroup({label:`prefilter env fs uniforms ${h}`,layout:this.prefilterEnvFSBindGroupLayout,entries:[{binding:0,resource:{buffer:w}},{binding:1,resource:this.prefilterEnvSampler},{binding:2,resource:this.rendererData.gpuEnvTextures[e].createView({dimension:"cube"})}]});for(let U=0;U<6;++U){const x=d.beginRenderPass({label:"prefilter env",colorAttachments:[{view:l.createView({dimension:"2d",baseArrayLayer:U,baseMipLevel:h,mipLevelCount:1}),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]});Cr(n,i,o[U],s[U]);const b=new ArrayBuffer(128),y={mvMatrix:new Float32Array(b,0,16),pMatrix:new Float32Array(b,64,16)};y.mvMatrix.set(n),y.pMatrix.set(r);const T=this.device.createBuffer({label:"prefilter env vs uniforms",size:128,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});g.push(T),this.device.queue.writeBuffer(T,0,b);const P=this.device.createBindGroup({label:"prefilter env vs bind group",layout:this.prefilterEnvVSBindGroupLayout,entries:[{binding:0,resource:{buffer:T}}]});x.setPipeline(this.prefilterEnvPiepeline),x.setBindGroup(0,P),x.setBindGroup(1,m),x.setVertexBuffer(0,this.cubeGPUVertexBuffer),x.draw(36),x.end()}}const f=d.finish();this.device.queue.submit([f]),this.device.queue.onSubmittedWorkDone().finally(()=>{g.forEach(h=>{h.destroy()})})}else if(mt(this.gl)){this.gl.useProgram(this.prefilterEnv.program);const l=this.rendererData.prefilteredEnvMap[e]=this.gl.createTexture();this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,l),this.gl.texStorage2D(this.gl.TEXTURE_CUBE_MAP,Ft,this.gl.RGBA16F,mr,mr);for(let d=0;d<Ft;++d)for(let g=0;g<6;++g){const f=mr*.5**d,h=new Float32Array(f*f*4);this.gl.texSubImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+g,d,0,0,f,f,this.gl.RGBA,this.gl.FLOAT,h)}this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_WRAP_R,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR),this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.cubeVertexBuffer),this.gl.enableVertexAttribArray(this.prefilterEnv.attributes.aPos),this.gl.vertexAttribPointer(this.prefilterEnv.attributes.aPos,3,this.gl.FLOAT,!1,0,0),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,a),this.gl.uniformMatrix4fv(this.prefilterEnv.uniforms.uPMatrix,!1,r),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,this.rendererData.envTextures[e]),this.gl.uniform1i(this.prefilterEnv.uniforms.uEnvironmentMap,0);for(let d=0;d<Ft;++d){const g=mr*.5**d,f=mr*.5**d;this.gl.viewport(0,0,g,f);const h=d/(Ft-1);this.gl.uniform1f(this.prefilterEnv.uniforms.uRoughness,h);for(let v=0;v<6;++v)this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+v,l,d),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),Cr(n,i,o[v],s[v]),this.gl.uniformMatrix4fv(this.prefilterEnv.uniforms.uMVMatrix,!1,n),this.gl.drawArrays(this.gl.TRIANGLES,0,36)}this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,null),this.gl.deleteFramebuffer(a)}}initShaderProgram(e,r,n,i){const o=$t(this.gl,e,this.gl.VERTEX_SHADER),s=$t(this.gl,r,this.gl.FRAGMENT_SHADER),a=this.gl.createProgram();if(this.gl.attachShader(a,o),this.gl.attachShader(a,s),this.gl.linkProgram(a),!this.gl.getProgramParameter(a,this.gl.LINK_STATUS))throw new Error("Could not initialise shaders");const c={};for(const l in n)if(c[l]=this.gl.getAttribLocation(a,l),c[l]<0)throw new Error("Missing shader attribute location: "+l);const u={};for(const l in i)if(u[l]=this.gl.getUniformLocation(a,l),!u[l])throw new Error("Missing shader uniform location: "+l);return{program:a,vertexShader:o,fragmentShader:s,attributes:c,uniforms:u}}destroyShaderProgramObject(e){e.program&&(e.vertexShader&&(this.gl.detachShader(e.program,e.vertexShader),this.gl.deleteShader(e.vertexShader),e.vertexShader=null),e.fragmentShader&&(this.gl.detachShader(e.program,e.fragmentShader),this.gl.deleteShader(e.fragmentShader),e.fragmentShader=null),this.gl.deleteProgram(e.program),e.program=null)}initShaders(){if(this.shaderProgram)return;let e;this.isHD?e=mt(this.gl)?Oh:Nh:this.softwareSkinning?e=dh:e=Gh;let r;this.isHD?r=mt(this.gl)?Hh:mh:r=fh;const n=this.vertexShader=$t(this.gl,e,this.gl.VERTEX_SHADER),i=this.fragmentShader=$t(this.gl,r,this.gl.FRAGMENT_SHADER),o=this.shaderProgram=this.gl.createProgram();if(this.gl.attachShader(o,n),this.gl.attachShader(o,i),this.gl.linkProgram(o),this.gl.getProgramParameter(o,this.gl.LINK_STATUS)||alert("Could not initialise shaders"),this.gl.useProgram(o),this.shaderProgramLocations.vertexPositionAttribute=this.gl.getAttribLocation(o,"aVertexPosition"),this.shaderProgramLocations.normalsAttribute=this.gl.getAttribLocation(o,"aNormal"),this.shaderProgramLocations.textureCoordAttribute=this.gl.getAttribLocation(o,"aTextureCoord"),this.isHD?(this.shaderProgramLocations.skinAttribute=this.gl.getAttribLocation(o,"aSkin"),this.shaderProgramLocations.weightAttribute=this.gl.getAttribLocation(o,"aBoneWeight"),this.shaderProgramLocations.tangentAttribute=this.gl.getAttribLocation(o,"aTangent")):this.softwareSkinning||(this.shaderProgramLocations.groupAttribute=this.gl.getAttribLocation(o,"aGroup")),this.shaderProgramLocations.pMatrixUniform=this.gl.getUniformLocation(o,"uPMatrix"),this.shaderProgramLocations.mvMatrixUniform=this.gl.getUniformLocation(o,"uMVMatrix"),this.shaderProgramLocations.samplerUniform=this.gl.getUniformLocation(o,"uSampler"),this.shaderProgramLocations.replaceableColorUniform=this.gl.getUniformLocation(o,"uReplaceableColor"),this.isHD?(this.shaderProgramLocations.normalSamplerUniform=this.gl.getUniformLocation(o,"uNormalSampler"),this.shaderProgramLocations.ormSamplerUniform=this.gl.getUniformLocation(o,"uOrmSampler"),this.shaderProgramLocations.lightPosUniform=this.gl.getUniformLocation(o,"uLightPos"),this.shaderProgramLocations.lightColorUniform=this.gl.getUniformLocation(o,"uLightColor"),this.shaderProgramLocations.cameraPosUniform=this.gl.getUniformLocation(o,"uCameraPos"),this.shaderProgramLocations.shadowParamsUniform=this.gl.getUniformLocation(o,"uShadowParams"),this.shaderProgramLocations.shadowMapSamplerUniform=this.gl.getUniformLocation(o,"uShadowMapSampler"),this.shaderProgramLocations.shadowMapLightMatrixUniform=this.gl.getUniformLocation(o,"uShadowMapLightMatrix"),this.shaderProgramLocations.hasEnvUniform=this.gl.getUniformLocation(o,"uHasEnv"),this.shaderProgramLocations.irradianceMapUniform=this.gl.getUniformLocation(o,"uIrradianceMap"),this.shaderProgramLocations.prefilteredEnvUniform=this.gl.getUniformLocation(o,"uPrefilteredEnv"),this.shaderProgramLocations.brdfLUTUniform=this.gl.getUniformLocation(o,"uBRDFLUT")):this.shaderProgramLocations.replaceableTypeUniform=this.gl.getUniformLocation(o,"uReplaceableType"),this.shaderProgramLocations.discardAlphaLevelUniform=this.gl.getUniformLocation(o,"uDiscardAlphaLevel"),this.shaderProgramLocations.tVertexAnimUniform=this.gl.getUniformLocation(o,"uTVertexAnim"),this.shaderProgramLocations.wireframeUniform=this.gl.getUniformLocation(o,"uWireframe"),!this.softwareSkinning){this.shaderProgramLocations.nodesMatricesAttributes=[];for(let s=0;s<Ye;++s)this.shaderProgramLocations.nodesMatricesAttributes[s]=this.gl.getUniformLocation(o,`uNodesMatrices[${s}]`)}this.isHD&&mt(this.gl)&&(this.envToCubemap=this.initShaderProgram(xh,Sh,{aPos:"aPos"},{uPMatrix:"uPMatrix",uMVMatrix:"uMVMatrix",uEquirectangularMap:"uEquirectangularMap"}),this.envSphere=this.initShaderProgram(wh,Ph,{aPos:"aPos"},{uPMatrix:"uPMatrix",uMVMatrix:"uMVMatrix",uEnvironmentMap:"uEnvironmentMap"}),this.convoluteDiffuseEnv=this.initShaderProgram(Th,yh,{aPos:"aPos"},{uPMatrix:"uPMatrix",uMVMatrix:"uMVMatrix",uEnvironmentMap:"uEnvironmentMap"}),this.prefilterEnv=this.initShaderProgram(Uh,Ch,{aPos:"aPos"},{uPMatrix:"uPMatrix",uMVMatrix:"uMVMatrix",uEnvironmentMap:"uEnvironmentMap",uRoughness:"uRoughness"}),this.integrateBRDF=this.initShaderProgram(Bh,Eh,{aPos:"aPos"},{}))}initGPUShaders(){if(!this.gpuShaderModule){this.gpuShaderModule=this.device.createShaderModule({label:"main",code:this.isHD?Xh:zh}),this.gpuDepthShaderModule=this.device.createShaderModule({label:"depth",code:Wh});for(let e=0;e<this.model.Textures.length;++e){const n=this.model.Textures[e].Flags,i=n&Qr.WrapWidth?"repeat":"clamp-to-edge",o=n&Qr.WrapHeight?"repeat":"clamp-to-edge";this.rendererData.gpuSamplers[e]=this.device.createSampler({label:`texture sampler ${e}`,minFilter:"linear",magFilter:"linear",mipmapFilter:"linear",maxAnisotropy:16,addressModeU:i,addressModeV:o})}this.rendererData.gpuDepthSampler=this.device.createSampler({label:"texture depth sampler",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",compare:"less",minFilter:"nearest",magFilter:"nearest"}),this.isHD&&(this.envShaderModeule=this.device.createShaderModule({label:"env",code:Lh}),this.envPiepeline=this.device.createRenderPipeline({label:"env",layout:"auto",vertex:{module:this.envShaderModeule,buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]}]},fragment:{module:this.envShaderModeule,targets:[{format:navigator.gpu.getPreferredCanvasFormat()}]},depthStencil:{depthWriteEnabled:!1,depthCompare:"always",format:"depth24plus"},multisample:{count:Sn}}),this.envVSUniformsBuffer=this.device.createBuffer({label:"env vs uniforms",size:128,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.envVSBindGroupLayout=this.envPiepeline.getBindGroupLayout(0),this.envVSBindGroup=this.device.createBindGroup({label:"env vs bind group",layout:this.envVSBindGroupLayout,entries:[{binding:0,resource:{buffer:this.envVSUniformsBuffer}}]}),this.envSampler=this.device.createSampler({label:"env cube sampler",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",addressModeW:"clamp-to-edge",minFilter:"linear",magFilter:"linear"}),this.envFSBindGroupLayout=this.envPiepeline.getBindGroupLayout(1),this.envToCubemapShaderModule=this.device.createShaderModule({label:"env to cubemap",code:Rh}),this.envToCubemapPiepeline=this.device.createRenderPipeline({label:"env to cubemap",layout:"auto",vertex:{module:this.envToCubemapShaderModule,buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]}]},fragment:{module:this.envToCubemapShaderModule,targets:[{format:navigator.gpu.getPreferredCanvasFormat()}]}}),this.envToCubemapVSBindGroupLayout=this.envToCubemapPiepeline.getBindGroupLayout(0),this.envToCubemapSampler=this.device.createSampler({label:"env to cubemap sampler",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",minFilter:"linear",magFilter:"linear"}),this.envToCubemapFSBindGroupLayout=this.envToCubemapPiepeline.getBindGroupLayout(1),this.convoluteDiffuseEnvShaderModule=this.device.createShaderModule({label:"convolute diffuse",code:Fh}),this.convoluteDiffuseEnvPiepeline=this.device.createRenderPipeline({label:"convolute diffuse",layout:"auto",vertex:{module:this.convoluteDiffuseEnvShaderModule,buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]}]},fragment:{module:this.convoluteDiffuseEnvShaderModule,targets:[{format:navigator.gpu.getPreferredCanvasFormat()}]}}),this.convoluteDiffuseEnvVSBindGroupLayout=this.convoluteDiffuseEnvPiepeline.getBindGroupLayout(0),this.convoluteDiffuseEnvFSBindGroupLayout=this.convoluteDiffuseEnvPiepeline.getBindGroupLayout(1),this.convoluteDiffuseEnvSampler=this.device.createSampler({label:"convolute diffuse",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",minFilter:"linear",magFilter:"linear"}),this.prefilterEnvShaderModule=this.device.createShaderModule({label:"prefilter env",code:$h}),this.prefilterEnvPiepeline=this.device.createRenderPipeline({label:"prefilter env",layout:"auto",vertex:{module:this.prefilterEnvShaderModule,buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]}]},fragment:{module:this.prefilterEnvShaderModule,targets:[{format:navigator.gpu.getPreferredCanvasFormat()}]}}),this.prefilterEnvVSBindGroupLayout=this.prefilterEnvPiepeline.getBindGroupLayout(0),this.prefilterEnvFSBindGroupLayout=this.prefilterEnvPiepeline.getBindGroupLayout(1),this.prefilterEnvSampler=this.device.createSampler({label:"prefilter env",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",addressModeW:"clamp-to-edge",minFilter:"linear",magFilter:"linear"}))}}createWireframeBuffer(e){const r=this.model.Geosets[e].Faces,n=new Uint16Array(r.length*2);for(let i=0;i<r.length;i+=3)n[i*2]=r[i],n[i*2+1]=r[i+1],n[i*2+2]=r[i+1],n[i*2+3]=r[i+2],n[i*2+4]=r[i+2],n[i*2+5]=r[i];this.wireframeIndexBuffer[e]=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.wireframeIndexBuffer[e]),this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,n,this.gl.STATIC_DRAW)}createWireframeGPUBuffer(e){const r=this.model.Geosets[e].Faces,n=new Uint16Array(r.length*2);for(let i=0;i<r.length;i+=3)n[i*2]=r[i],n[i*2+1]=r[i+1],n[i*2+2]=r[i+1],n[i*2+3]=r[i+2],n[i*2+4]=r[i+2],n[i*2+5]=r[i];this.wireframeIndexGPUBuffer[e]=this.device.createBuffer({label:`wireframe ${e}`,size:n.byteLength,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0}),new Uint16Array(this.wireframeIndexGPUBuffer[e].getMappedRange(0,this.wireframeIndexGPUBuffer[e].size)).set(n),this.wireframeIndexGPUBuffer[e].unmap()}initBuffers(){for(let e=0;e<this.model.Geosets.length;++e){const r=this.model.Geosets[e];if(this.vertexBuffer[e]=this.gl.createBuffer(),this.softwareSkinning?this.vertices[e]=new Float32Array(r.Vertices.length):(this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer[e]),this.gl.bufferData(this.gl.ARRAY_BUFFER,r.Vertices,this.gl.STATIC_DRAW)),this.normalBuffer[e]=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.normalBuffer[e]),this.gl.bufferData(this.gl.ARRAY_BUFFER,r.Normals,this.gl.STATIC_DRAW),this.texCoordBuffer[e]=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.texCoordBuffer[e]),this.gl.bufferData(this.gl.ARRAY_BUFFER,r.TVertices[0],this.gl.STATIC_DRAW),this.isHD)this.skinWeightBuffer[e]=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.skinWeightBuffer[e]),this.gl.bufferData(this.gl.ARRAY_BUFFER,r.SkinWeights,this.gl.STATIC_DRAW),this.tangentBuffer[e]=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.tangentBuffer[e]),this.gl.bufferData(this.gl.ARRAY_BUFFER,r.Tangents,this.gl.STATIC_DRAW);else if(!this.softwareSkinning){this.groupBuffer[e]=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.groupBuffer[e]);const n=new Uint16Array(r.VertexGroup.length*4);for(let i=0;i<n.length;i+=4){const o=i/4,s=r.Groups[r.VertexGroup[o]];n[i]=s[0],n[i+1]=s.length>1?s[1]:Ye,n[i+2]=s.length>2?s[2]:Ye,n[i+3]=s.length>3?s[3]:Ye}this.gl.bufferData(this.gl.ARRAY_BUFFER,n,this.gl.STATIC_DRAW)}this.indexBuffer[e]=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer[e]),this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,r.Faces,this.gl.STATIC_DRAW)}}createGPUPipeline(e,r,n,i=this.gpuShaderModule,o={}){return this.device.createRenderPipeline({label:`pipeline ${e}`,layout:this.gpuPipelineLayout,vertex:{module:i,buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]},{arrayStride:12,attributes:[{shaderLocation:1,offset:0,format:"float32x3"}]},{arrayStride:8,attributes:[{shaderLocation:2,offset:0,format:"float32x2"}]},...this.isHD?[{arrayStride:16,attributes:[{shaderLocation:3,offset:0,format:"float32x4"}]},{arrayStride:8,attributes:[{shaderLocation:4,offset:0,format:"uint8x4"}]},{arrayStride:8,attributes:[{shaderLocation:5,offset:4,format:"unorm8x4"}]}]:[{arrayStride:4,attributes:[{shaderLocation:3,offset:0,format:"uint8x4"}]}]]},fragment:{module:i,targets:[{format:navigator.gpu.getPreferredCanvasFormat(),blend:r}]},depthStencil:n,multisample:{count:Sn},...o})}createGPUPipelineByLayer(e,r){return this.createGPUPipeline(...Yh[e],void 0,{primitive:{cullMode:r?"none":"back"}})}getGPUPipeline(e){const r=e.FilterMode||0,n=!!((e.Shading||0)&Tt.TwoSided),i=`${r}-${n}`;return this.gpuPipelines[i]||(this.gpuPipelines[i]=this.createGPUPipelineByLayer(r,n)),this.gpuPipelines[i]}initGPUPipeline(){this.vsBindGroupLayout=this.device.createBindGroupLayout({label:"vs bind group layout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform",hasDynamicOffset:!1,minBindingSize:128+64*Ye}}]}),this.fsBindGroupLayout=this.device.createBindGroupLayout({label:"fs bind group layout2",entries:this.isHD?[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform",hasDynamicOffset:!1,minBindingSize:192}},{binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}},{binding:3,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}},{binding:4,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}},{binding:5,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}},{binding:6,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}},{binding:7,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"comparison"}},{binding:8,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"depth",viewDimension:"2d",multisampled:!1}},{binding:9,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}},{binding:10,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float",viewDimension:"cube",multisampled:!1}},{binding:11,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}},{binding:12,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float",viewDimension:"cube",multisampled:!1}},{binding:13,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}},{binding:14,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}}]:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform",hasDynamicOffset:!1,minBindingSize:80}},{binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}}]}),this.gpuPipelineLayout=this.device.createPipelineLayout({label:"pipeline layout",bindGroupLayouts:[this.vsBindGroupLayout,this.fsBindGroupLayout]}),this.gpuWireframePipeline=this.createGPUPipeline("wireframe",{color:{operation:"add",srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"},alpha:{operation:"add",srcFactor:"one",dstFactor:"one-minus-src-alpha"}},{depthWriteEnabled:!0,depthCompare:"less-equal",format:"depth24plus"},void 0,{primitive:{topology:"line-list"}}),this.isHD&&(this.gpuShadowPipeline=this.createGPUPipeline("shadow",void 0,{depthWriteEnabled:!0,depthCompare:"less-equal",format:"depth32float"},this.gpuDepthShaderModule,{fragment:{module:this.gpuDepthShaderModule,targets:[]},multisample:{count:1}})),this.gpuRenderPassDescriptor={label:"basic renderPass",colorAttachments:[{view:null,clearValue:[.15,.15,.15,1],loadOp:"clear",storeOp:"store"}]}}initGPUBuffers(){for(let e=0;e<this.model.Geosets.length;++e){const r=this.model.Geosets[e];if(this.gpuVertexBuffer[e]=this.device.createBuffer({label:`vertex ${e}`,size:r.Vertices.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(this.gpuVertexBuffer[e].getMappedRange(0,this.gpuVertexBuffer[e].size)).set(r.Vertices),this.gpuVertexBuffer[e].unmap(),this.gpuNormalBuffer[e]=this.device.createBuffer({label:`normal ${e}`,size:r.Normals.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(this.gpuNormalBuffer[e].getMappedRange(0,this.gpuNormalBuffer[e].size)).set(r.Normals),this.gpuNormalBuffer[e].unmap(),this.gpuTexCoordBuffer[e]=this.device.createBuffer({label:`texCoord ${e}`,size:r.TVertices[0].byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(this.gpuTexCoordBuffer[e].getMappedRange(0,this.gpuTexCoordBuffer[e].size)).set(r.TVertices[0]),this.gpuTexCoordBuffer[e].unmap(),this.isHD)this.gpuSkinWeightBuffer[e]=this.device.createBuffer({label:`SkinWeight ${e}`,size:r.SkinWeights.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Uint8Array(this.gpuSkinWeightBuffer[e].getMappedRange(0,this.gpuSkinWeightBuffer[e].size)).set(r.SkinWeights),this.gpuSkinWeightBuffer[e].unmap(),this.gpuTangentBuffer[e]=this.device.createBuffer({label:`Tangents ${e}`,size:r.Tangents.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(this.gpuTangentBuffer[e].getMappedRange(0,this.gpuTangentBuffer[e].size)).set(r.Tangents),this.gpuTangentBuffer[e].unmap();else{const i=new Uint8Array(r.VertexGroup.length*4);for(let o=0;o<i.length;o+=4){const s=o/4,a=r.Groups[r.VertexGroup[s]];i[o]=a[0],i[o+1]=a.length>1?a[1]:Ye,i[o+2]=a.length>2?a[2]:Ye,i[o+3]=a.length>3?a[3]:Ye}this.gpuGroupBuffer[e]=this.device.createBuffer({label:`group ${e}`,size:4*r.VertexGroup.length,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Uint8Array(this.gpuGroupBuffer[e].getMappedRange(0,this.gpuGroupBuffer[e].size)).set(i),this.gpuGroupBuffer[e].unmap()}const n=Math.ceil(r.Faces.byteLength/4)*4;this.gpuIndexBuffer[e]=this.device.createBuffer({label:`index ${e}`,size:2*n,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0}),new Uint16Array(this.gpuIndexBuffer[e].getMappedRange(0,n)).set(r.Faces),this.gpuIndexBuffer[e].unmap()}}initGPUUniformBuffers(){this.gpuVSUniformsBuffer=this.device.createBuffer({label:"vs uniforms",size:128+64*Ye,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.gpuVSUniformsBindGroup=this.device.createBindGroup({label:"vs uniforms bind group",layout:this.vsBindGroupLayout,entries:[{binding:0,resource:{buffer:this.gpuVSUniformsBuffer}}]})}initGPUMultisampleTexture(){this.gpuMultisampleTexture=this.device.createTexture({label:"multisample texutre",size:[this.canvas.width,this.canvas.height],format:navigator.gpu.getPreferredCanvasFormat(),usage:GPUTextureUsage.RENDER_ATTACHMENT,sampleCount:Sn})}initGPUDepthTexture(){this.gpuDepthTexture=this.device.createTexture({label:"depth texture",size:[this.canvas.width,this.canvas.height],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT,sampleCount:Sn})}initGPUEmptyTexture(){const e=this.rendererData.gpuEmptyTexture=this.device.createTexture({label:"empty texture",size:[1,1],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});this.device.queue.writeTexture({texture:e},new Uint8Array([255,255,255,255]),{bytesPerRow:4},{width:1,height:1}),this.rendererData.gpuEmptyCubeTexture=this.device.createTexture({label:"empty cube texture",size:[1,1,6],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),this.rendererData.gpuDepthEmptyTexture=this.device.createTexture({label:"empty depth texture",size:[1,1],format:"depth32float",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST})}initCube(){const e=new Float32Array([-.5,-.5,-.5,-.5,.5,-.5,.5,-.5,-.5,-.5,.5,-.5,.5,.5,-.5,.5,-.5,-.5,-.5,-.5,.5,.5,-.5,.5,-.5,.5,.5,-.5,.5,.5,.5,-.5,.5,.5,.5,.5,-.5,.5,-.5,-.5,.5,.5,.5,.5,-.5,-.5,.5,.5,.5,.5,.5,.5,.5,-.5,-.5,-.5,-.5,.5,-.5,-.5,-.5,-.5,.5,-.5,-.5,.5,.5,-.5,-.5,.5,-.5,.5,-.5,-.5,-.5,-.5,-.5,.5,-.5,.5,-.5,-.5,-.5,.5,-.5,.5,.5,-.5,.5,-.5,.5,-.5,-.5,.5,.5,-.5,.5,-.5,.5,.5,-.5,.5,.5,.5,-.5,.5,.5,.5]);if(this.device){const r=this.cubeGPUVertexBuffer=this.device.createBuffer({label:"skeleton vertex",size:e.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0});new Float32Array(r.getMappedRange(0,r.size)).set(e),r.unmap()}else this.cubeVertexBuffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.cubeVertexBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e,this.gl.STATIC_DRAW)}initSquare(){this.squareVertexBuffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.squareVertexBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),this.gl.STATIC_DRAW)}initBRDFLUT(){if(!mt(this.gl)||!this.isHD||!this.colorBufferFloatExt)return;this.brdfLUT=this.gl.createTexture(),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.brdfLUT),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RG16F,Mr,Mr,0,this.gl.RG,this.gl.FLOAT,null),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR);const e=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,e),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,this.brdfLUT,0),this.gl.useProgram(this.integrateBRDF.program),this.gl.viewport(0,0,Mr,Mr),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.squareVertexBuffer),this.gl.enableVertexAttribArray(this.integrateBRDF.attributes.aPos),this.gl.vertexAttribPointer(this.integrateBRDF.attributes.aPos,2,this.gl.FLOAT,!1,0,0),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.deleteFramebuffer(e)}initGPUBRDFLUT(){const e=this.device.createShaderModule({label:"integrate brdf",code:Vh});this.gpuBrdfLUT=this.device.createTexture({label:"brdf",size:[Mr,Mr],format:"rg16float",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});const r=new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),n=this.device.createBuffer({label:"brdf square",size:r.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0});new Float32Array(n.getMappedRange(0,n.size)).set(r),n.unmap();const i=this.device.createCommandEncoder({label:"integrate brdf"}),o=i.beginRenderPass({label:"integrate brdf",colorAttachments:[{view:this.gpuBrdfLUT.createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]});o.setPipeline(this.device.createRenderPipeline({label:"integrate brdf",layout:"auto",vertex:{module:e,buffers:[{arrayStride:8,attributes:[{shaderLocation:0,offset:0,format:"float32x2"}]}]},fragment:{module:e,targets:[{format:"rg16float"}]}})),o.setVertexBuffer(0,n),o.draw(6),o.end();const s=i.finish();this.device.queue.submit([s]),this.device.queue.onSubmittedWorkDone().finally(()=>{n.destroy()}),this.gpuBrdfSampler=this.device.createSampler({label:"brdf lut",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",minFilter:"linear",magFilter:"linear"})}updateGlobalSequences(e){for(let r=0;r<this.rendererData.globalSequencesFrames.length;++r)this.rendererData.globalSequencesFrames[r]+=e,this.rendererData.globalSequencesFrames[r]>this.model.GlobalSequences[r]&&(this.rendererData.globalSequencesFrames[r]=0)}updateNode(e){const r=this.interp.vec3(Ei,e.node.Translation),n=this.interp.quat(Ai,e.node.Rotation),i=this.interp.vec3(Mi,e.node.Scaling);!r&&!n&&!i?al(e.matrix):r&&!n&&!i?Uf(e.matrix,r):!r&&n&&!i?bn(e.matrix,n,e.node.PivotPoint):Ef(e.matrix,n||Di,r||_i,i||Li,e.node.PivotPoint),(e.node.Parent||e.node.Parent===0)&&xn(e.matrix,this.rendererData.nodes[e.node.Parent].matrix,e.matrix);const o=e.node.Flags&ir.BillboardedLockX||e.node.Flags&ir.BillboardedLockY||e.node.Flags&ir.BillboardedLockZ;e.node.Flags&ir.Billboarded?(yt(pr,e.node.PivotPoint,e.matrix),(e.node.Parent||e.node.Parent===0)&&(Bf(wn,this.rendererData.nodes[e.node.Parent].matrix),zf(wn,wn),bn(Ls,wn,pr),xn(e.matrix,Ls,e.matrix)),bn(Rs,this.rendererData.cameraQuat,pr),xn(e.matrix,Rs,e.matrix)):o&&(yt(pr,e.node.PivotPoint,e.matrix),zr(Lt,e.node.PivotPoint),e.node.Flags&ir.BillboardedLockX?Lt[0]+=1:e.node.Flags&ir.BillboardedLockY?Lt[1]+=1:e.node.Flags&ir.BillboardedLockZ&&(Lt[2]+=1),yt(Lt,Lt,e.matrix),Bs(Lt,Lt,pr),dt(rr,1,0,0),Cs(rr,rr,e.node.PivotPoint),yt(rr,rr,e.matrix),Bs(rr,rr,pr),dt(Pn,-1,0,0),cl(Pn,Pn,this.rendererData.cameraQuat),Rr(Vs,Lt,Pn),Rr(Tn,Lt,Vs),to(Tn,Tn),Yf(Fs,rr,Tn),bn($s,Fs,pr),xn(e.matrix,$s,e.matrix));for(const s of e.childs)this.updateNode(s)}findAlpha(e){const r=this.rendererData.geosetAnims[e];if(!r||r.Alpha===void 0)return 1;if(typeof r.Alpha=="number")return r.Alpha;const n=this.interp.num(r.Alpha);return n===null?1:n}getTexCoordMatrix(e){if(typeof e.TVertexAnimId=="number"){const r=this.rendererData.model.TextureAnims[e.TVertexAnimId],n=this.interp.vec3(Ei,r.Translation),i=this.interp.quat(Ai,r.Rotation),o=this.interp.vec3(Mi,r.Scaling);return ys(at,i||Di,n||_i,o||Li),Ts(Un,at[0],at[1],0,at[4],at[5],0,at[12],at[13],0),Un}else return ks}setLayerProps(e,r){const n=this.model.Textures[r];e.Shading&Tt.TwoSided?this.gl.disable(this.gl.CULL_FACE):this.gl.enable(this.gl.CULL_FACE),e.FilterMode===Re.Transparent?this.gl.uniform1f(this.shaderProgramLocations.discardAlphaLevelUniform,.75):this.gl.uniform1f(this.shaderProgramLocations.discardAlphaLevelUniform,0),e.FilterMode===Re.None?(this.gl.disable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.depthMask(!0)):e.FilterMode===Re.Transparent?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA,this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA),this.gl.depthMask(!0)):e.FilterMode===Re.Blend?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA,this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA),this.gl.depthMask(!1)):e.FilterMode===Re.Additive?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFunc(this.gl.SRC_COLOR,this.gl.ONE),this.gl.depthMask(!1)):e.FilterMode===Re.AddAlpha?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE),this.gl.depthMask(!1)):e.FilterMode===Re.Modulate?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.ZERO,this.gl.SRC_COLOR,this.gl.ZERO,this.gl.ONE),this.gl.depthMask(!1)):e.FilterMode===Re.Modulate2x&&(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.DST_COLOR,this.gl.SRC_COLOR,this.gl.ZERO,this.gl.ONE),this.gl.depthMask(!1)),n.Image?(this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[n.Image]),this.gl.uniform1i(this.shaderProgramLocations.samplerUniform,0),this.gl.uniform1f(this.shaderProgramLocations.replaceableTypeUniform,0)):(n.ReplaceableId===1||n.ReplaceableId===2)&&(this.gl.uniform3fv(this.shaderProgramLocations.replaceableColorUniform,this.rendererData.teamColor),this.gl.uniform1f(this.shaderProgramLocations.replaceableTypeUniform,n.ReplaceableId)),e.Shading&Tt.NoDepthTest&&this.gl.disable(this.gl.DEPTH_TEST),e.Shading&Tt.NoDepthSet&&this.gl.depthMask(!1),this.gl.uniformMatrix3fv(this.shaderProgramLocations.tVertexAnimUniform,!1,this.getTexCoordMatrix(e))}setLayerPropsHD(e,r){const n=r[0],i=this.rendererData.materialLayerTextureID[e],o=this.rendererData.materialLayerNormalTextureID[e],s=this.rendererData.materialLayerOrmTextureID[e],a=i[0],c=this.model.Textures[a],u=n?.ShaderTypeId===1?o[0]:i[1],l=this.model.Textures[u],d=n?.ShaderTypeId===1?s[0]:i[2],g=this.model.Textures[d];if(n.Shading&Tt.TwoSided?this.gl.disable(this.gl.CULL_FACE):this.gl.enable(this.gl.CULL_FACE),n.FilterMode===Re.Transparent?this.gl.uniform1f(this.shaderProgramLocations.discardAlphaLevelUniform,.75):this.gl.uniform1f(this.shaderProgramLocations.discardAlphaLevelUniform,0),n.FilterMode===Re.None?(this.gl.disable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.depthMask(!0)):n.FilterMode===Re.Transparent?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA,this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA),this.gl.depthMask(!0)):n.FilterMode===Re.Blend?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA,this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA),this.gl.depthMask(!1)):n.FilterMode===Re.Additive?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFunc(this.gl.SRC_COLOR,this.gl.ONE),this.gl.depthMask(!1)):n.FilterMode===Re.AddAlpha?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE),this.gl.depthMask(!1)):n.FilterMode===Re.Modulate?(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.ZERO,this.gl.SRC_COLOR,this.gl.ZERO,this.gl.ONE),this.gl.depthMask(!1)):n.FilterMode===Re.Modulate2x&&(this.gl.enable(this.gl.BLEND),this.gl.enable(this.gl.DEPTH_TEST),this.gl.blendFuncSeparate(this.gl.DST_COLOR,this.gl.SRC_COLOR,this.gl.ZERO,this.gl.ONE),this.gl.depthMask(!1)),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[c.Image]),this.gl.uniform1i(this.shaderProgramLocations.samplerUniform,0),n.Shading&Tt.NoDepthTest&&this.gl.disable(this.gl.DEPTH_TEST),n.Shading&Tt.NoDepthSet&&this.gl.depthMask(!1),typeof n.TVertexAnimId=="number"){const f=this.rendererData.model.TextureAnims[n.TVertexAnimId],h=this.interp.vec3(Ei,f.Translation),v=this.interp.quat(Ai,f.Rotation),S=this.interp.vec3(Mi,f.Scaling);ys(at,v||Di,h||_i,S||Li),Ts(Un,at[0],at[1],0,at[4],at[5],0,at[12],at[13],0),this.gl.uniformMatrix3fv(this.shaderProgramLocations.tVertexAnimUniform,!1,Un)}else this.gl.uniformMatrix3fv(this.shaderProgramLocations.tVertexAnimUniform,!1,ks);this.gl.activeTexture(this.gl.TEXTURE1),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[l.Image]),this.gl.uniform1i(this.shaderProgramLocations.normalSamplerUniform,1),this.gl.activeTexture(this.gl.TEXTURE2),this.gl.bindTexture(this.gl.TEXTURE_2D,this.rendererData.textures[g.Image]),this.gl.uniform1i(this.shaderProgramLocations.ormSamplerUniform,2),this.gl.uniform3fv(this.shaderProgramLocations.replaceableColorUniform,this.rendererData.teamColor)}}var Ln=1e-6,xt=typeof Float32Array<"u"?Float32Array:Array;function io(){var t=new xt(9);return xt!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[5]=0,t[6]=0,t[7]=0),t[0]=1,t[4]=1,t[8]=1,t}function dl(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[4],t[4]=e[5],t[5]=e[6],t[6]=e[8],t[7]=e[9],t[8]=e[10],t}function ar(){var t=new xt(16);return xt!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t}function fl(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}function hl(t,e){var r=e[0],n=e[1],i=e[2],o=e[3],s=e[4],a=e[5],c=e[6],u=e[7],l=e[8],d=e[9],g=e[10],f=e[11],h=e[12],v=e[13],S=e[14],p=e[15],w=r*a-n*s,m=r*c-i*s,U=r*u-o*s,x=n*c-i*a,b=n*u-o*a,y=i*u-o*c,T=l*v-d*h,P=l*S-g*h,k=l*p-f*h,L=d*S-g*v,N=d*p-f*v,D=g*p-f*S,V=w*D-m*N+U*L+x*k-b*P+y*T;return V?(V=1/V,t[0]=(a*D-c*N+u*L)*V,t[1]=(i*N-n*D-o*L)*V,t[2]=(v*y-S*b+p*x)*V,t[3]=(g*b-d*y-f*x)*V,t[4]=(c*k-s*D-u*P)*V,t[5]=(r*D-i*k+o*P)*V,t[6]=(S*U-h*y-p*m)*V,t[7]=(l*y-g*U+f*m)*V,t[8]=(s*N-a*k+u*T)*V,t[9]=(n*k-r*N-o*T)*V,t[10]=(h*b-v*U+p*w)*V,t[11]=(d*U-l*b-f*w)*V,t[12]=(a*P-s*L-c*T)*V,t[13]=(r*L-n*P+i*T)*V,t[14]=(v*m-h*x-S*w)*V,t[15]=(l*x-d*m+g*w)*V,t):null}function Kh(t,e,r,n,i){var o=1/Math.tan(e/2);if(t[0]=o/r,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=o,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,i!=null&&i!==1/0){var s=1/(n-i);t[10]=(i+n)*s,t[14]=2*i*n*s}else t[10]=-1,t[14]=-2*n;return t}var gl=Kh;function Qh(t,e,r,n,i,o,s){var a=1/(e-r),c=1/(n-i),u=1/(o-s);return t[0]=-2*a,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=-2*c,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=2*u,t[11]=0,t[12]=(e+r)*a,t[13]=(i+n)*c,t[14]=(s+o)*u,t[15]=1,t}var Zh=Qh;function Yi(t,e,r,n){var i,o,s,a,c,u,l,d,g,f,h=e[0],v=e[1],S=e[2],p=n[0],w=n[1],m=n[2],U=r[0],x=r[1],b=r[2];return Math.abs(h-U)<Ln&&Math.abs(v-x)<Ln&&Math.abs(S-b)<Ln?fl(t):(l=h-U,d=v-x,g=S-b,f=1/Math.sqrt(l*l+d*d+g*g),l*=f,d*=f,g*=f,i=w*g-m*d,o=m*l-p*g,s=p*d-w*l,f=Math.sqrt(i*i+o*o+s*s),f?(f=1/f,i*=f,o*=f,s*=f):(i=0,o=0,s=0),a=d*s-g*o,c=g*i-l*s,u=l*o-d*i,f=Math.sqrt(a*a+c*c+u*u),f?(f=1/f,a*=f,c*=f,u*=f):(a=0,c=0,u=0),t[0]=i,t[1]=a,t[2]=l,t[3]=0,t[4]=o,t[5]=c,t[6]=d,t[7]=0,t[8]=s,t[9]=u,t[10]=g,t[11]=0,t[12]=-(i*h+o*v+s*S),t[13]=-(a*h+c*v+u*S),t[14]=-(l*h+d*v+g*S),t[15]=1,t)}function $r(){var t=new xt(3);return xt!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function jh(t){var e=t[0],r=t[1],n=t[2];return Math.sqrt(e*e+r*r+n*n)}function kt(t,e,r){var n=new xt(3);return n[0]=t,n[1]=e,n[2]=r,n}function Vt(t,e,r,n){return t[0]=e,t[1]=r,t[2]=n,t}function Jh(t,e){var r=e[0],n=e[1],i=e[2],o=r*r+n*n+i*i;return o>0&&(o=1/Math.sqrt(o)),t[0]=e[0]*o,t[1]=e[1]*o,t[2]=e[2]*o,t}function eg(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]}function Ri(t,e,r){var n=e[0],i=e[1],o=e[2],s=r[0],a=r[1],c=r[2];return t[0]=i*c-o*a,t[1]=o*s-n*c,t[2]=n*a-i*s,t}var tg=jh;(function(){var t=$r();return function(e,r,n,i,o,s){var a,c;for(r||(r=3),n||(n=0),i?c=Math.min(i*r+n,e.length):c=e.length,a=n;a<c;a+=r)t[0]=e[a],t[1]=e[a+1],t[2]=e[a+2],o(t,t,s),e[a]=t[0],e[a+1]=t[1],e[a+2]=t[2];return e}})();function rg(){var t=new xt(4);return xt!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[3]=0),t}function ng(t,e,r,n){var i=new xt(4);return i[0]=t,i[1]=e,i[2]=r,i[3]=n,i}function ig(t,e){var r=e[0],n=e[1],i=e[2],o=e[3],s=r*r+n*n+i*i+o*o;return s>0&&(s=1/Math.sqrt(s)),t[0]=r*s,t[1]=n*s,t[2]=i*s,t[3]=o*s,t}(function(){var t=rg();return function(e,r,n,i,o,s){var a,c;for(r||(r=4),n||(n=0),i?c=Math.min(i*r+n,e.length):c=e.length,a=n;a<c;a+=r)t[0]=e[a],t[1]=e[a+1],t[2]=e[a+2],t[3]=e[a+3],o(t,t,s),e[a]=t[0],e[a+1]=t[1],e[a+2]=t[2],e[a+3]=t[3];return e}})();function Nn(){var t=new xt(4);return xt!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t[3]=1,t}function ml(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t}function og(t,e,r){r=r*.5;var n=Math.sin(r);return t[0]=n*e[0],t[1]=n*e[1],t[2]=n*e[2],t[3]=Math.cos(r),t}function Fi(t,e,r,n){var i=e[0],o=e[1],s=e[2],a=e[3],c=r[0],u=r[1],l=r[2],d=r[3],g,f,h,v,S;return f=i*c+o*u+s*l+a*d,f<0&&(f=-f,c=-c,u=-u,l=-l,d=-d),1-f>Ln?(g=Math.acos(f),h=Math.sin(g),v=Math.sin((1-n)*g)/h,S=Math.sin(n*g)/h):(v=1-n,S=n),t[0]=v*i+S*c,t[1]=v*o+S*u,t[2]=v*s+S*l,t[3]=v*a+S*d,t}function oo(t,e){var r=e[0]+e[4]+e[8],n;if(r>0)n=Math.sqrt(r+1),t[3]=.5*n,n=.5/n,t[0]=(e[5]-e[7])*n,t[1]=(e[6]-e[2])*n,t[2]=(e[1]-e[3])*n;else{var i=0;e[4]>e[0]&&(i=1),e[8]>e[i*3+i]&&(i=2);var o=(i+1)%3,s=(i+2)%3;n=Math.sqrt(e[i*3+i]-e[o*3+o]-e[s*3+s]+1),t[i]=.5*n,n=.5/n,t[3]=(e[o*3+s]-e[s*3+o])*n,t[o]=(e[o*3+i]+e[i*3+o])*n,t[s]=(e[s*3+i]+e[i*3+s])*n}return t}var sg=ng,Xn=ig;(function(){var t=$r(),e=kt(1,0,0),r=kt(0,1,0);return function(n,i,o){var s=eg(i,o);return s<-.999999?(Ri(t,e,i),tg(t)<1e-6&&Ri(t,r,i),Jh(t,t),og(n,t,Math.PI),n):s>.999999?(n[0]=0,n[1]=0,n[2]=0,n[3]=1,n):(Ri(t,i,o),n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=1+s,Xn(n,n))}})();(function(){var t=Nn(),e=Nn();return function(r,n,i,o,s,a){return Fi(t,n,s,a),Fi(e,i,o,a),Fi(r,t,e,2*a*(1-a)),r}})();(function(){var t=io();return function(e,r,n,i){return t[0]=n[0],t[3]=n[1],t[6]=n[2],t[1]=i[0],t[4]=i[1],t[7]=i[2],t[2]=-r[0],t[5]=-r[1],t[8]=-r[2],Xn(e,oo(e,t))}})();const Ut={Human:{tile:"Human",esc:"human",lower:"human",display:"Human"},Orc:{tile:"Orc",esc:"orc",lower:"orc",display:"Orc"},NightElf:{tile:"NightElf",esc:"nightelf",lower:"nightelf",display:"Night Elf"},Undead:{tile:"Undead",esc:"undead",lower:"undead",display:"Undead"}},[Pt,ag]=C("Human");var lg=Y('<canvas style="position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-size:100% 100%;-webkit-mask-size:100% 100%;mask-position:center;-webkit-mask-position:center">');const Is=new Map,Gs=new Map,Ns=new Map;function cg(t){let e=Number.POSITIVE_INFINITY,r=Number.NEGATIVE_INFINITY,n=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,o=!1;for(const s of t.Geosets||[]){if(!s.Faces||s.Faces.length===0)continue;const a=s.Vertices;for(let c=0;c<a.length;c+=3){const u=a[c],l=a[c+1];u<e&&(e=u),u>r&&(r=u),l<n&&(n=l),l>i&&(i=l),o=!0}}return o?{minX:e,maxX:r,minY:n,maxY:i}:null}function ug(t){const e=new Set(["plane01","sunrise/set"]);for(const r of t.Geosets||[]){const n=r.Groups?.[0]?.[0];if(n==null)continue;const i=t.Nodes?.[n]?.Name?.toLowerCase();!i||!e.has(i)||(r.Faces=new Uint16Array(0))}}function dg(t){return`/models/time-indicator/${Ut[t].tile}UI-TimeIndicator.mdx`}function fg(t,e){const r=t.replaceAll("\\","/").toLowerCase(),n=Ut[e].tile,i=`/models/time-indicator/textures/${e}/`;return r.includes("genericglowfaded")?`${i}GenericGlowFaded.blp`:r.includes("star3")?`${i}star3.blp`:r.includes("genericglow2_32")?`${i}GenericGlow2_32.blp`:r.includes("timeindicatorframe")?`${i}${n}UITile-TimeIndicatorFrame.blp`:r.includes("timeindicator")?`${i}HumanUITile-TimeIndicator.blp`:null}function hg(t){const e=Ut[t].tile;return`/models/time-indicator/textures/${t}/${e}UITile-TimeIndicatorFrame.blp`}function gg(t,e,r,n,i){const o=(c,u)=>c>=0&&u>=0&&c<e&&u<r,s=(c,u)=>t[(u*e+c)*4+3];if(o(n,i)&&s(n,i)===0)return i*e+n;const a=Math.max(e,r);for(let c=1;c<a;c++){for(let u=-c;u<=c;u++){const l=i+u,d=n-c,g=n+c;if(o(d,l)&&s(d,l)===0)return l*e+d;if(o(g,l)&&s(g,l)===0)return l*e+g}for(let u=-c+1;u<=c-1;u++){const l=n+u,d=i-c,g=i+c;if(o(l,d)&&s(l,d)===0)return d*e+l;if(o(l,g)&&s(l,g)===0)return g*e+l}}return-1}async function mg(t){const e=Ns.get(t);if(e)return e;const r=(await pl(hg(t)))[0];if(!r||r.width<=0||r.height<=0)throw new Error(`Invalid frame texture for ${t}`);const n=r.width,i=r.height,o=Math.round(n*.49),s=Math.round(i*.34),a=gg(r.data,n,i,o,s);if(a<0)throw new Error(`Unable to locate clock aperture for ${t}`);const c=new Uint8Array(n*i),u=new Int32Array(n*i);let l=0,d=0;for(u[d++]=a,c[a]=1;l<d;){const S=u[l++],p=S%n,w=S/n|0,m=[[p-1,w],[p+1,w],[p,w-1],[p,w+1]];for(const[U,x]of m){if(U<0||x<0||U>=n||x>=i)continue;const b=x*n+U;c[b]||r.data[b*4+3]===0&&(c[b]=1,u[d++]=b)}}const g=new Uint8ClampedArray(n*i*4);for(let S=0;S<n*i;S++){if(!(r.data[S*4+3]>0||c[S]===1))continue;const m=S*4;g[m+0]=255,g[m+1]=255,g[m+2]=255,g[m+3]=255}const f=document.createElement("canvas");f.width=n,f.height=i;const h=f.getContext("2d");if(!h)throw new Error("Failed to create widget mask canvas");h.putImageData(new ImageData(g,n,i),0,0);const v=f.toDataURL("image/png");return Ns.set(t,v),v}async function pg(t){const e=Is.get(t);if(e)return e;const r=await fetch(dg(t));if(!r.ok)throw new Error(`Failed to fetch clock model for ${t}`);const n=await r.arrayBuffer(),i=Hn(n);return ug(i),Is.set(t,i),i}async function pl(t){const e=Gs.get(t);if(e)return e;const r=await fetch(t);if(!r.ok)throw new Error(`Failed to fetch texture ${t}`);const n=await r.arrayBuffer(),i=rn(n),o=[],s=Math.max(1,Math.floor(Math.log2(Math.max(i.width,i.height)))+1);for(let a=0;a<s;a++){const c=i.width>>a,u=i.height>>a;if(c<=0||u<=0)break;try{const l=nn(i,a);if(!l||!l.width||!l.height||(o.push(new ImageData(l.data,l.width,l.height)),l.width===1&&l.height===1))break}catch{break}}if(o.length===0)throw new Error(`No mip levels decoded for ${t}`);return Gs.set(t,o),o}function vg(t){let e;const[r,n]=C("init"),[i,o]=C("");let s=null,a=null,c=0,u=null,l=!1,d=0,g=0,f=1,h=0,v=1;const S=ar(),p=ar(),w=()=>{if(a)try{a.destroy()}catch(b){console.warn("clock renderer destroy failed",b)}finally{a=null}},m=()=>{if(!e||!s)return;const b=window.devicePixelRatio||1,y=Math.max(1,Math.round(e.clientWidth*b)),T=Math.max(1,Math.round(e.clientHeight*b));(e.width!==y||e.height!==T)&&(e.width=y,e.height=T),s.viewport(0,0,y,T)},U=()=>{const b=performance.now(),y=T=>{if(l||(c=requestAnimationFrame(y),!s))return;if(!a){n("waiting renderer");return}m();const P=(T-b)*1%6e4;a.setSequence(0),a.setFrame(P),a.update(0),fl(S);const k=Math.max(1e-6,f-g),L=Math.max(1e-6,v-h),N=(g+f)*.5,D=(h+v)*.5,V=Math.max(1e-6,e.clientWidth/Math.max(1,e.clientHeight)),$=k/L;let I=k*1.04,pe=L*1.04;V>$?I=pe*V:pe=I/V,Zh(p,N-I*.5,N+I*.5,D-pe*.5,D+pe*.5,-10,10),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT|s.DEPTH_BUFFER_BIT),a.render(S,p,{env:!1,wireframe:!1}),n("rendering")};c=requestAnimationFrame(y)},x=async b=>{const y=++d;n(`loading model: ${b}`);const T=await pg(b);if(l||y!==d)return;w(),a=new no(T),a.initGL(s),a.setCamera(kt(0,0,2),sg(0,0,0,1)),a.setLightPosition(kt(0,0,2)),a.setLightColor(kt(1,1,1)),n(`model loaded: ${b}`);const P=cg(T);if(P)g=P.minX,f=P.maxX,h=P.minY,v=P.maxY;else{const N=T.Info?.MinimumExtent,D=T.Info?.MaximumExtent;N&&D&&(g=N[0],f=D[0],h=N[1],v=D[1])}const k=(T.Textures||[]).map(async N=>{const D=fg(N.Image,b);if(!D)return;const V=await pl(D);!l&&y===d&&a.setTextureImageData(N.Image,V)}),[L]=await Promise.all([mg(b),Promise.all(k)]);l||y!==d||(o(L),a.setSequence(0),n(`textures bound: ${b}`))};return Xt(()=>{if(s=e.getContext("webgl2",{alpha:!0,premultipliedAlpha:!1,antialias:!0,depth:!0,stencil:!1}),s||(s=e.getContext("webgl",{alpha:!0,premultipliedAlpha:!1,antialias:!0,depth:!0,stencil:!1})),!s){n("no webgl context");return}n("gl context ok"),m(),u=new ResizeObserver(()=>m()),u.observe(e),U(),x(t.race)}),de(()=>{const b=t.race;s&&x(b)}),ce(()=>{l=!0,d++,cancelAnimationFrame(c),u?.disconnect(),w()}),(()=>{var b=lg(),y=e;return typeof y=="function"?we(y,b):e=b,me(T=>{var P=i()?`url("${i()}")`:"none",k=i()?`url("${i()}")`:"none";return P!==T.e&&ie(b,"mask-image",T.e=P),k!==T.t&&ie(b,"-webkit-mask-image",T.t=k),T},{e:void 0,t:void 0}),b})()}var bg=Y("<canvas aria-hidden=true style=position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none>");const xg=[1,2,3,4],vr=0,br=.125,Os=0,Hs=.33984375,Sg=.79296875,wg=1,$i=32,zs=10.875,Pg=6.875,Tg=32,yg=4,Ug=1;function Cg(t,e){const r=Ut[t].tile;return`/console/${t}/${r}UITile0${e}.png`}function Xs(t,e,r){const n=t.createShader(e);return n?(t.shaderSource(n,r),t.compileShader(n),t.getShaderParameter(n,t.COMPILE_STATUS)?n:(console.error("Top HUD shader compile failed:",t.getShaderInfoLog(n)),t.deleteShader(n),null)):null}function Bg(t){const e=`
    attribute vec2 a_position;
    attribute vec2 a_uv;
    varying vec2 v_uv;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_uv = a_uv;
    }
  `,r=`
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_texture;
    void main() {
      vec4 color = texture2D(u_texture, v_uv);
      if (color.a < 0.5) {
        discard;
      }
      gl_FragColor = color;
    }
  `,n=Xs(t,t.VERTEX_SHADER,e),i=Xs(t,t.FRAGMENT_SHADER,r);if(!n||!i)return null;const o=t.createProgram();return o?(t.attachShader(o,n),t.attachShader(o,i),t.linkProgram(o),t.deleteShader(n),t.deleteShader(i),t.getProgramParameter(o,t.LINK_STATUS)?o:(console.error("Top HUD program link failed:",t.getProgramInfoLog(o)),t.deleteProgram(o),null)):null}function Eg(t){let e,r=null,n=null,i=null,o=-1,s=-1,a=null,c=!1,u=!1,l=0,d=null;const g=new Map,f=new Map;let h=null;const v=()=>{u||c||(u=!0,l=window.requestAnimationFrame(()=>{u=!1,w()}))},S=()=>{if(!r)return;const x=window.devicePixelRatio||1,b=Math.max(1,e.clientWidth||1),y=Math.max(1,e.clientHeight||1),T=Math.round(b*x),P=Math.round(y*x);(e.width!==T||e.height!==P)&&(e.width=T,e.height=P),r.viewport(0,0,T,P)},p=(x,b,y,T,P,k,L,N,D)=>{if(!r||!i)return;const V=e.width,$=e.height;if(V<=0||$<=0||T<=0||P<=0)return;const I=b/V*2-1,pe=1-y/$*2,K=(b+T)/V*2-1,Te=1-(y+P)/$*2,Ie=new Float32Array([I,pe,k,L,K,pe,N,L,I,Te,k,D,K,pe,N,L,K,Te,N,D,I,Te,k,D]);r.bindTexture(r.TEXTURE_2D,x),r.bindBuffer(r.ARRAY_BUFFER,i),r.bufferData(r.ARRAY_BUFFER,Ie,r.STREAM_DRAW),r.drawArrays(r.TRIANGLES,0,6)},w=()=>{if(!r||!n||!i||!h)return;S();const x=e.width,b=e.height;if(x<=0||b<=0)return;r.clear(r.COLOR_BUFFER_BIT),r.useProgram(n),r.bindBuffer(r.ARRAY_BUFFER,i),r.enableVertexAttribArray(o),r.vertexAttribPointer(o,2,r.FLOAT,!1,16,0),r.enableVertexAttribArray(s),r.vertexAttribPointer(s,2,r.FLOAT,!1,16,8),r.activeTexture(r.TEXTURE0),r.uniform1i(a,0);const y=window.devicePixelRatio||1,T=Ug*y,P=x/100,k=b;if(t.leftOnly){const Ie=$i+zs,Le=$i/Ie*x+T,Oe=Le-T,Fe=x-Oe;p(h[1],0,0,Le,k,0,vr,1,br),p(h[2],Oe,0,Fe,k,Os,vr,Hs,br);return}const L=$i*P+T,N=zs*P+T,D=L-T;p(h[1],0,0,L,k,0,vr,1,br),p(h[2],D,0,N,k,Os,vr,Hs,br);const V=Pg*P+T,$=Tg*P+T,I=yg*P+T,pe=x-I,K=pe-($-T),Te=K-(V-T);p(h[2],Te,0,V,k,Sg,vr,wg,br),p(h[3],K,0,$,k,0,vr,1,br),p(h[4],pe,0,I,k,0,vr,1,br)},m=x=>{if(!r)return Promise.resolve(null);const b=g.get(x);if(b)return Promise.resolve(b);const y=f.get(x);if(y)return y;const T=new Promise(P=>{const k=new Image;k.onload=()=>{if(!r||c){f.delete(x),P(null);return}const L=r.createTexture();if(!L){f.delete(x),P(null);return}r.bindTexture(r.TEXTURE_2D,L),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,k),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),g.set(x,L),f.delete(x),P(L)},k.onerror=()=>{console.error(`Failed to load top HUD texture: ${x}`),f.delete(x),P(null)},k.src=x});return f.set(x,T),T},U=async x=>{if(!r||c)return;const b=xg.map(T=>Cg(x,T)),y=await Promise.all(b.map(T=>m(T)));c||y.some(T=>T===null)||(h={1:y[0],2:y[1],3:y[2],4:y[3]},v())};return Xt(()=>{if(r=e.getContext("webgl",{alpha:!0,premultipliedAlpha:!1,antialias:!1,depth:!1,stencil:!1}),!r){console.error("WebGL is unavailable for top HUD rendering.");return}if(n=Bg(r),!n)return;if(o=r.getAttribLocation(n,"a_position"),s=r.getAttribLocation(n,"a_uv"),a=r.getUniformLocation(n,"u_texture"),i=r.createBuffer(),o<0||s<0||!a||!i){console.error("Failed to initialize top HUD WebGL buffers.");return}r.disable(r.DEPTH_TEST),r.disable(r.CULL_FACE),r.enable(r.BLEND),r.blendFunc(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA),r.clearColor(0,0,0,0),U(t.race),v();const x=()=>v();window.addEventListener("resize",x),typeof ResizeObserver<"u"&&(d=new ResizeObserver(()=>v()),d.observe(e)),ce(()=>{if(c=!0,window.removeEventListener("resize",x),d&&(d.disconnect(),d=null),l&&window.cancelAnimationFrame(l),r){for(const b of g.values())r.deleteTexture(b);i&&r.deleteBuffer(i),n&&r.deleteProgram(n)}})}),de(()=>{const x=t.race;!r||c||U(x)}),de(()=>{t.leftOnly,v()}),(()=>{var x=bg(),b=e;return typeof b=="function"?we(b,x):e=x,x})()}var Ag=Y('<section class=hero-section><div class=hero-content><img src=/logo.avif alt=WC3UI class=hero-logo><p class=hero-subtitle>Battle-tested components forged in Azeroth.</p><p class=hero-description>A themeable, accessible component library inspired by the Warcraft III interface.<br>Ships with four faction themes out of the box.<br><strong>1.2kb core</strong> · Zero dependencies · Framework-agnostic.</p><div class="hero-cta-row hero-cta-row--components"><button type=button class="esc-option-preview hero-get-started-btn"><canvas class=esc-option-canvas></canvas><span class=esc-option-label>Get <span class=button-hotkey>S</span>tarted</span></button><label class="wc3-editbox wc3-editbox--esc hero-install-editbox"><canvas class=wc3-editbox-canvas></canvas><input type=text value="npm i wc3ui"readonly aria-label="Copy install command"></label></div><div class=hero-version-label>Patch 1.27b</div><p class=social-proof>Used by 2,300+ developers · 11.4k GitHub stars · Compatible with React, Vue, Svelte, and vanilla JS');function Mg(t){const e=()=>{navigator.clipboard.writeText("npm i wc3ui")};return(()=>{var r=Ag(),n=r.firstChild,i=n.firstChild,o=i.nextSibling,s=o.nextSibling,a=s.nextSibling,c=a.firstChild,u=c.firstChild,l=u.nextSibling,d=c.nextSibling,g=d.firstChild,f=g.nextSibling;vn(c,"mouseup",t.onGetStartedMouseUp,!0),vn(c,"mousedown",t.onGetStartedMouseDown,!0),vn(c,"mouseleave",t.onGetStartedMouseLeave),vn(c,"mouseenter",t.onGetStartedMouseEnter);var h=t.getStartedCanvasRef;typeof h=="function"?we(h,u):t.getStartedCanvasRef=u,d.$$click=e;var v=t.installCanvasRef;return typeof v=="function"?we(v,g):t.installCanvasRef=g,f.addEventListener("focus",S=>S.currentTarget.select()),me(S=>ie(l,"transform",t.getStartedPressed?"translate(2px, 2px)":"none")),r})()}ji(["mousedown","mouseup","click"]);var _g=Y('<article class=faction-preview-card><div class=faction-preview-label></div><div class=faction-preview-samples><div class=faction-preview-control><div class=faction-preview-control-label>Button</div><button type=button class="esc-option-preview faction-preview-option-button"><canvas class=esc-option-canvas></canvas><span class=esc-option-label><span class=button-hotkey>O</span>ptions</span></button></div><div class=faction-preview-control><div class=faction-preview-control-label>Slider</div><label class="esc-slider-demo faction-preview-slider-demo"><span class=esc-slider-value>%</span><div class="esc-slider-track faction-preview-slider-track"><canvas class=esc-slider-canvas></canvas><div class=esc-slider-knob></div><input type=range min=0 max=100>'),Dg=Y('<section class="section-card faction-preview-section"><p class=section-desc>Every component adapts to your chosen faction. One prop changes everything. We wish CSS had thought of this.</p><div class=faction-preview>');const Ws=[{race:"Human",label:"Human"},{race:"Orc",label:"Orc"},{race:"NightElf",label:"Night Elf"},{race:"Undead",label:"Undead"}],Lg=2,Rg=2,Fg=220,$g=28,sr={escBgUrl:"",escBgDownUrl:"",escBorderUrl:"",escBorderDownUrl:"",escHoverUrl:"",sliderKnobUrl:""},Vg={Human:sr,Orc:sr,NightElf:sr,Undead:sr},qs=new Map,Ys=new Map;function kg(t){return/\/buttons\/esc\/[^/]+\/[^/]+-options-(?:menu|button)-background(?:-down|-disabled)?\.blp$/i.test(t)}async function nr(t){const e=qs.get(t);if(e)return e;const r=(async()=>{const n=await fetch(t);if(!n.ok)throw new Error(`Failed to fetch ${t}`);const i=await n.arrayBuffer(),o=rn(i),s=nn(o,0),a=new Uint8ClampedArray(s.data);if(kg(t)){let l=!0;for(let d=3;d<a.length;d+=4)if(a[d]!==0){l=!1;break}if(l)for(let d=3;d<a.length;d+=4)a[d]=255}const c=document.createElement("canvas");c.width=s.width,c.height=s.height;const u=c.getContext("2d");if(!u)throw new Error(`Failed to decode ${t}`);return u.putImageData(new ImageData(a,s.width,s.height),0,0),c.toDataURL("image/png")})();return qs.set(t,r),r}async function Wr(t){const e=Ys.get(t);if(e)return e;const r=new Promise((n,i)=>{const o=new Image;o.onload=()=>n(o),o.onerror=()=>i(new Error(`Failed to load image ${t}`)),o.src=t});return Ys.set(t,r),r}function Ig(t){return t==="Orc"?"/buttons/slider/orc-slider-knob.blp":t==="NightElf"?"/buttons/slider/nightelf-slider-knob.blp":t==="Undead"?"/buttons/slider/undead-slider-knob.blp":"/buttons/slider/slider-knob.blp"}function Gg(t){const e="/buttons/esc/human/human-options-button-border-up.blp",r="/buttons/esc/human/human-options-button-border-down.blp";return t==="Human"?{bg:"/buttons/esc/human/human-options-menu-background.blp",bgDown:"/buttons/esc/human/human-options-menu-background.blp",border:e,borderDown:r,hover:"/buttons/esc/human/human-options-button-highlight.blp"}:t==="Orc"?{bg:"/buttons/esc/orc/orc-options-button-background.blp",bgDown:"/buttons/esc/orc/orc-options-button-background-down.blp",border:e,borderDown:r,hover:"/buttons/esc/orc/orc-options-button-highlight.blp"}:t==="NightElf"?{bg:"/buttons/esc/nightelf/nightelf-options-button-background.blp",bgDown:"/buttons/esc/nightelf/nightelf-options-button-background-down.blp",border:e,borderDown:r,hover:"/buttons/esc/nightelf/nightelf-options-button-highlight.blp"}:{bg:"/buttons/esc/undead/undead-options-button-background.blp",bgDown:"/buttons/esc/undead/undead-options-button-background-down.blp",border:e,borderDown:r,hover:"/buttons/esc/undead/undead-options-button-highlight.blp"}}function Ng(t,e,r){const n=Math.max(0,Math.min(100,t)),i=r*.5,o=Math.max(i,e-r*.5);return`${(i+(o-i)*n/100)/e*100}%`}function Ks(t,e,r,n){const i=document.createElement("canvas");i.width=n,i.height=r;const o=i.getContext("2d");return o&&(o.translate(n,0),o.rotate(Math.PI/2),o.drawImage(t,e*r,0,r,n,0,0,r,n)),i}function Qs(t,e,r,n,i){const o=Math.max(1,t.clientWidth||1),s=Math.max(1,t.clientHeight||1),a=window.devicePixelRatio||1,c=Math.max(1,Math.round(o*a)),u=Math.max(1,Math.round(s*a));(t.width!==c||t.height!==u)&&(t.width=c,t.height=u);const l=t.getContext("2d");if(!l)return;l.setTransform(a,0,0,a,0,0),l.clearRect(0,0,o,s);const d=r.width,g=r.height,f=d/8,h=Math.max(1,Math.floor(Math.min(f,s*.35,o/2,s/2))),v=Math.max(1,Math.round(h*.25));l.fillStyle="#000",l.fillRect(v,v,o-v*2,s-v*2);const S=l.createPattern(e,"repeat");S&&(l.fillStyle=S,l.fillRect(v,v,o-v*2,s-v*2));const p=(U,x,b,y,T)=>{l.drawImage(r,U*f,0,f,g,x,b,y,T)};p(4,0,0,h,h),p(5,o-h,0,h,h),p(6,0,s-h,h,h),p(7,o-h,s-h,h,h);const w=s-h*2;w>0&&(p(0,0,h,h,w),p(1,o-h,h,h,w));const m=o-h*2;if(m>0){const U=Ks(r,2,f,g),x=Ks(r,3,f,g);l.drawImage(U,h,0,m,h),l.drawImage(x,h,s-h,m,h)}if(i&&n){const U=document.createElement("canvas");U.width=c,U.height=u;const x=U.getContext("2d");x&&(x.setTransform(a,0,0,a,0,0),x.drawImage(t,0,0,o,s),x.globalCompositeOperation="source-in",x.drawImage(n,0,0,o,s),l.save(),l.globalCompositeOperation="lighter",l.drawImage(U,0,0,o,s),l.restore())}}function Og(t){let e,r,n;const[i,o]=C(!1),[s,a]=C(!1),[c,u]=C(55),l=()=>{t.resizeTick();const d=Math.max(1,Math.round(n?.clientWidth||Fg));return Ng(c(),d,$g)};return de(()=>{const d=e,g=s()?t.assets().escBgDownUrl:t.assets().escBgUrl,f=s()?t.assets().escBorderDownUrl:t.assets().escBorderUrl,h=t.assets().escHoverUrl,v=i()&&!s();if(!d||!g||!f)return;let S=!1;Promise.all([Wr(g),Wr(f),h?Wr(h):Promise.resolve(null)]).then(([p,w,m])=>{S||Qs(d,p,w,m,v)}).catch(p=>console.error(p)),ce(()=>{S=!0})}),de(()=>{t.resizeTick();const d=r,g=t.sliderTrackBgUrl(),f=t.sliderTrackBorderAtlasUrl();if(!d||!g||!f)return;let h=!1;Promise.all([Wr(g),Wr(f)]).then(([v,S])=>{h||Qs(d,v,S,null,!1)}).catch(v=>console.error(v)),ce(()=>{h=!0})}),(()=>{var d=_g(),g=d.firstChild,f=g.nextSibling,h=f.firstChild,v=h.firstChild,S=v.nextSibling,p=S.firstChild,w=p.nextSibling,m=h.nextSibling,U=m.firstChild,x=U.nextSibling,b=x.firstChild,y=b.firstChild,T=b.nextSibling,P=T.firstChild,k=P.nextSibling,L=k.nextSibling;_(g,()=>t.label),S.$$mouseup=()=>a(!1),S.$$mousedown=()=>a(!0),S.addEventListener("mouseleave",()=>{o(!1),a(!1)}),S.addEventListener("mouseenter",()=>o(!0));var N=e;typeof N=="function"?we(N,p):e=p,_(b,c,y);var D=n;typeof D=="function"?we(D,T):n=T;var V=r;return typeof V=="function"?we(V,P):r=P,L.$$input=$=>u(Number($.currentTarget.value)),me($=>{var I=s()?`translate(${Lg}px, ${Rg}px)`:"none",pe=t.assets().sliderKnobUrl?`url("${t.assets().sliderKnobUrl}")`:"none",K=l(),Te=`${t.label} slider preview`;return I!==$.e&&ie(w,"transform",$.e=I),pe!==$.t&&ie(k,"background-image",$.t=pe),K!==$.a&&ie(k,"left",$.a=K),Te!==$.o&&le(L,"aria-label",$.o=Te),$},{e:void 0,t:void 0,a:void 0,o:void 0}),me(()=>L.value=c()),d})()}function Hg(){const[t,e]=C(Vg),[r,n]=C(""),[i,o]=C(""),[s,a]=C(0);return Xt(()=>{let c=!1;Promise.all([Promise.all(Ws.map(async({race:l})=>{const d=Gg(l),[g,f,h,v,S,p]=await Promise.all([nr(d.bg),nr(d.bgDown),nr(d.border),nr(d.borderDown),nr(d.hover),nr(Ig(l))]);return[l,{escBgUrl:g,escBgDownUrl:f,escBorderUrl:h,escBorderDownUrl:v,escHoverUrl:S,sliderKnobUrl:p}]})),nr("/buttons/slider/slider-background.blp"),nr("/buttons/slider/slider-border.blp")]).then(([l,d,g])=>{if(c)return;const f={Human:{...sr},Orc:{...sr},NightElf:{...sr},Undead:{...sr}};for(const[h,v]of l)f[h]=v;e(f),n(d),o(g)}).catch(l=>console.error(l));const u=()=>a(l=>l+1);window.addEventListener("resize",u),ce(()=>{c=!0,window.removeEventListener("resize",u)})}),(()=>{var c=Dg(),u=c.firstChild,l=u.nextSibling;return _(l,ue(kn,{each:Ws,children:({race:d,label:g})=>ue(Og,{race:d,label:g,assets:()=>t()[d],sliderTrackBgUrl:r,sliderTrackBorderAtlasUrl:i,resizeTick:s})})),c})()}ji(["mousedown","mouseup","input"]);var zg=Y("<canvas style=position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none>");const vl={Human:{modelPath:"/models/hero-portrait/Human/HeroArchMage_portrait.mdx",textures:{"heroarchmage.blp":"/models/hero-portrait/textures/Human/HeroArchmage.blp"}},Orc:{modelPath:"/models/hero-portrait/Orc/HeroBladeMaster_portrait.mdx",textures:{"heroblademaster.blp":"/models/hero-portrait/textures/Orc/HeroBladeMaster.blp"}},NightElf:{modelPath:"/models/hero-portrait/NightElf/HeroDemonHunter_Portrait.mdx",textures:{"herodemonhunter.blp":"/models/hero-portrait/textures/NightElf/HeroDemonHunter.blp","black32.blp":"/models/hero-portrait/textures/NightElf/Black32.blp"}},Undead:{modelPath:"/models/hero-portrait/Undead/HeroDeathKnight_portrait.mdx",textures:{"herodeathknight.blp":"/models/hero-portrait/textures/Undead/HeroDeathknight.blp"}}},Zs=new Map,js=new Map;function Xg(t){const e=t.replaceAll("\\","/"),r=e.lastIndexOf("/");return(r>=0?e.slice(r+1):e).toLowerCase()}function Wg(t,e){const r=Xg(t),n=vl[e].textures[r];return n||(r.startsWith("teamcolor")?"/models/hero-portrait/textures/shared/TeamColor00.blp":r.startsWith("teamglow")?"/models/hero-portrait/textures/shared/TeamGlow00.blp":null)}async function qg(t){const e=vl[t].modelPath,r=Zs.get(e);if(r)return r;const n=await fetch(e);if(!n.ok)throw new Error(`Failed to load hero portrait model: ${e}`);const i=await n.arrayBuffer(),o=Hn(i);return Zs.set(e,o),o}async function Yg(t){const e=js.get(t);if(e)return e;const r=await fetch(t);if(!r.ok)throw new Error(`Failed to load hero portrait texture: ${t}`);const n=await r.arrayBuffer(),i=rn(n),o=[],s=Math.max(1,Math.floor(Math.log2(Math.max(i.width,i.height)))+1);for(let a=0;a<s;a++){const c=i.width>>a,u=i.height>>a;if(c<=0||u<=0)break;try{const l=nn(i,a);if(!l||!l.width||!l.height||(o.push(new ImageData(l.data,l.width,l.height)),l.width===1&&l.height===1))break}catch{break}}if(o.length===0)throw new Error(`No mip levels decoded for hero portrait texture: ${t}`);return js.set(t,o),o}function Kg(t){const e=t.Sequences||[];if(e.length===0)return 0;const r=i=>e.findIndex(o=>i((o.Name||"").toLowerCase()));let n=r(i=>i.includes("portrait")&&!i.includes("talk"));return n>=0||(n=r(i=>i.includes("stand")),n>=0)||(n=r(i=>i.includes("portrait")),n>=0)?n:0}function Qg(t){let e,r=null,n=null,i=null,o=0,s=!1,a=0;const c=ar(),u=ar(),l=ar(),d=$r(),g=$r(),f=Nn();let h=.691111,v=8,S=1800;const p=()=>{if(n)try{n.destroy()}catch(y){console.warn("hero portrait renderer destroy failed",y)}finally{n=null}},w=()=>{if(!e)return;const y=Math.max(1e-6,e.clientWidth/Math.max(1,e.clientHeight));gl(u,h,y,v,S)},m=()=>{if(!e||!r)return;const y=window.devicePixelRatio||1,T=Math.max(1,Math.round(e.clientWidth*y)),P=Math.max(1,Math.round(e.clientHeight*y));(e.width!==T||e.height!==P)&&(e.width=T,e.height=P),r.viewport(0,0,T,P),w()},U=y=>{const T=y.Cameras?.[0];if(T)Vt(d,T.Position[0],T.Position[1],T.Position[2]),Vt(g,T.TargetPosition[0],T.TargetPosition[1],T.TargetPosition[2]),h=Math.max(.35,T.FieldOfView||.691111),v=Math.max(4,T.NearClip||8),S=Math.max(v+100,T.FarClip||1800),Yi(c,d,g,kt(0,0,1));else{const P=y.Info?.MinimumExtent,k=y.Info?.MaximumExtent;if(P&&k){const L=(P[0]+k[0])*.5,N=(P[1]+k[1])*.5,D=(P[2]+k[2])*.5,V=Math.max(140,y.Info?.BoundsRadius||180);Vt(d,L+V*.2,N-V*1.8,D+V*.2),Vt(g,L,N,D)}else Vt(d,0,-450,120),Vt(g,0,0,110);h=.691111,v=8,S=1800,Yi(c,d,g,kt(0,0,1))}if(hl(l,c)){const P=io();dl(P,l),oo(f,P),Xn(f,f)}else ml(f)},x=()=>{let y=performance.now();const T=P=>{if(s||(o=requestAnimationFrame(T),!r||!n))return;m();const k=Math.min(100,P-y);y=P,n.update(k),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT),n.render(c,u,{env:!1,wireframe:!1})};o=requestAnimationFrame(T)},b=async y=>{const T=++a,P=await qg(y);if(s||T!==a||!r)return;p(),n=new no(P),n.initGL(r),U(P),n.setCamera(d,f),n.setLightPosition(d),n.setLightColor(kt(1,1,1)),n.setSequence(Kg(P));const k=(P.Textures||[]).map(async L=>{const N=Wg(L.Image,y);if(!N)return;const D=await Yg(N);!s&&T===a&&n.setTextureImageData(L.Image,D)});await Promise.all(k)};return Xt(()=>{r=e.getContext("webgl2",{alpha:!0,premultipliedAlpha:!1,antialias:!0,depth:!0,stencil:!1}),r||(r=e.getContext("webgl",{alpha:!0,premultipliedAlpha:!1,antialias:!0,depth:!0,stencil:!1})),r&&(m(),i=new ResizeObserver(()=>m()),i.observe(e),x(),b(t.race).catch(y=>console.error(y)))}),de(()=>{const y=t.race;r&&b(y).catch(T=>console.error(T))}),ce(()=>{s=!0,a++,cancelAnimationFrame(o),i?.disconnect(),p()}),(()=>{var y=zg(),T=e;return typeof T=="function"?we(T,y):e=y,y})()}var Zg=Y("<section class=section-card><h3>Buttons</h3><p class=section-desc>Beveled, gold-trimmed buttons with faction-aware theming and glow states. Your design system has a primary button. Ours has four."),jg=Y("<section class=section-card><h3>Controls</h3><p class=section-desc>Checkboxes, sliders, radio buttons, and edit fields. Every form deserves the production value of an options menu."),Jg=Y("<section class=button-showcase-section><h4 class=button-showcase-title></h4><p class=button-showcase-desc>"),em=Y("<section class=section-card><h3>Resource Counters</h3><p class=section-desc>Animated numeric display with icon slot. For when a number needs to feel important. Ticks up smoothly like gold flowing into your treasury."),tm=Y('<section class=section-card><h3>CommandCard</h3><p class=section-desc>A spatial action grid with hotkey hints, cooldown states, and empty-slot affordances. Faster than a command palette — your users already know the layout.</p><div class=command-card-preview><div class=command-card-grid role=grid aria-label="Command card preview">'),rm=Y("<div class=command-card-cell role=gridcell>"),nm=Y('<div class="cmd-btn cmd-btn-empty"aria-hidden=true>'),Js=Y("<img alt class=cmd-btn-frame>"),im=Y("<button type=button class=cmd-btn>"),om=Y("<img alt class=cmd-btn-icon>"),sm=Y("<div class=cmd-btn-fallback-icon aria-hidden=true>*"),am=Y('<div class="cmd-btn-highlight cmd-btn-highlight--on">'),lm=Y("<span class=cmd-btn-hotkey aria-hidden=true>"),cm=Y('<section class=section-card><h3>Unit Queue</h3><p class=section-desc>A task queue with progress indicator and cancelable pending slots. Perfect for managing build pipelines, AI agent workflows, or anything that trains in 30 seconds.</p><div class=unit-queue-preview><div class=unit-queue-stage aria-label="Build queue backdrop preview">'),um=Y("<canvas class=unit-queue-canvas>"),dm=Y("<div class=unit-queue-fallback>"),fm=Y("<section class=section-card><h3>Tooltip</h3><p class=section-desc>Rich content tooltips with title, description, hotkey badge, and inline resource costs. Your <code>title</code> attribute could never.</p><div class=tooltip-preview-grid><article class=tooltip-preview><div class=tooltip-preview-head><h4>Build Footman</h4><span class=tooltip-hotkey>F</span></div><p>Basic frontline infantry. Strong against early pressure and pairs with priest support.</p><div class=tooltip-costs><span class=tooltip-cost><img alt> 135</span><span class=tooltip-cost><img alt> 0</span><span class=tooltip-cost><img alt> 2"),hm=Y("<section class=section-card><h3>PortraitFrame</h3><p class=section-desc>A hero-tier avatar frame with live 3D portrait rendering. Because your users deserve better than a circle crop.</p><div class=portrait-showcase><div class=portrait-stage-wrap><div class=portrait-stage><div class=portrait-window></div><img alt class=portrait-frame-overlay></div></div><div class=button-state-label>3D Hero Portrait (<!>)"),gm=Y("<section class=section-card><h3>HealthBar / ManaBar / XPBar / Progress / Loading</h3><p class=section-desc>Health, mana, XP, build, and fullscreen loading bars with animated drain, fill, and layered overlays.");function mm(t){return(()=>{var e=Zg(),r=e.firstChild;return r.nextSibling,_(e,()=>t.children,null),e})()}function pm(t){return(()=>{var e=jg(),r=e.firstChild;return r.nextSibling,_(e,()=>t.children,null),e})()}function Ne(t){return(()=>{var e=Jg(),r=e.firstChild,n=r.nextSibling;return _(r,()=>t.title),_(n,()=>t.description),_(e,()=>t.children,null),e})()}function vm(t){return(()=>{var e=em(),r=e.firstChild;return r.nextSibling,_(e,()=>t.children,null),e})()}function bm(t){const e=[{hotkey:"Q",label:"Move",iconKey:"move",state:"ready"},{hotkey:"W",label:"Stop",iconKey:"stop",state:"ready"},{hotkey:"E",label:"Hold Position",iconKey:"holdPosition",state:"ready"},{hotkey:"R",label:"Attack",iconKey:"attack",state:"ready"},{hotkey:"A",label:"Patrol",iconKey:"patrol",state:"ready"},{hotkey:"S",label:"Empty Slot",state:"empty"},{hotkey:"D",label:"Empty Slot",state:"empty"},{hotkey:"F",label:"Learn Skill",iconKey:"skillz",state:"levelup"},{hotkey:"Z",label:"Wind Walk",iconKey:"windWalk",state:"active"},{hotkey:"X",label:"Mirror Image",iconKey:"mirrorImage",state:"ready"},{hotkey:"C",label:"Critical Strike",iconKey:"criticalStrike",state:"passive"},{hotkey:"V",label:"Bladestorm",iconKey:"bladestorm",state:"ready"}];return(()=>{var r=tm(),n=r.firstChild,i=n.nextSibling,o=i.nextSibling,s=o.firstChild;return _(s,ue(kn,{each:e,children:a=>(()=>{var c=rm();return _(c,(()=>{var u=ft(()=>a.state==="empty");return()=>u()?(()=>{var l=nm();return _(l,(()=>{var d=ft(()=>!!t.groupBorderUrl);return()=>d()&&(()=>{var g=Js();return me(()=>le(g,"src",t.groupBorderUrl)),g})()})()),l})():(()=>{const l=()=>a.iconKey&&t.iconUrls?.[a.iconKey]||"",d=a.state==="active";return(()=>{var g=im();return _(g,(()=>{var f=ft(()=>!!l());return()=>f()?(()=>{var h=om();return me(()=>le(h,"src",l())),h})():sm()})(),null),_(g,(()=>{var f=ft(()=>!!t.groupBorderUrl);return()=>f()&&(()=>{var h=Js();return me(()=>le(h,"src",t.groupBorderUrl)),h})()})(),null),_(g,d&&(()=>{var f=am();return me(h=>Ji(f,t.highlightUrl?{"background-image":`url("${t.highlightUrl}")`}:void 0,h)),f})(),null),_(g,(()=>{var f=ft(()=>!!a.hotkey);return()=>f()&&(()=>{var h=lm();return _(h,()=>a.hotkey),h})()})(),null),me(f=>{var h=a.state==="passive",v=a.state==="levelup",S=`${a.label}${a.hotkey?` (${a.hotkey})`:""}`,p=a.hotkey||void 0;return h!==f.e&&g.classList.toggle("cmd-btn--passive",f.e=h),v!==f.t&&g.classList.toggle("cmd-btn--levelup",f.t=v),S!==f.a&&le(g,"aria-label",f.a=S),p!==f.o&&le(g,"aria-keyshortcuts",f.o=p),f},{e:void 0,t:void 0,a:void 0,o:void 0}),g})()})()})()),c})()})),r})()}const ea={width:241,height:93},xm={x:6,y:5,width:42,height:42},Sm=[xm,{x:5,y:57,width:31,height:30},{x:45,y:58,width:31,height:30},{x:85,y:58,width:31,height:30},{x:125,y:58,width:31,height:30}];async function ta(t){return new Promise((e,r)=>{const n=new Image;n.onload=()=>e(n),n.onerror=()=>r(new Error(`Failed to load image: ${t}`)),n.src=t})}function wm(t,e,r,n,i,o){t.save(),t.imageSmoothingEnabled=!1,t.drawImage(e,r,n,i,o),t.restore()}function Pm(t,e,r){const n=t.getBoundingClientRect(),i=Math.max(1,n.width),o=Math.max(1,n.height),s=window.devicePixelRatio||1,a=Math.max(1,Math.round(i*s)),c=Math.max(1,Math.round(o*s));(t.width!==a||t.height!==c)&&(t.width=a,t.height=c);const u=t.getContext("2d");if(!u)return;const l=i/ea.width,d=o/ea.height;if(u.setTransform(s,0,0,s,0,0),u.clearRect(0,0,i,o),u.imageSmoothingEnabled=!1,u.drawImage(e,0,0,i,o),!!r)for(const g of Sm)wm(u,r,g.x*l,g.y*d,g.width*l,g.height*d)}function Tm(t){let e;return de(()=>{const r=e,n=t.backdropUrl,i=t.iconUrl;if(!r||!n)return;let o=!1;Promise.all([ta(n),i?ta(i):Promise.resolve(null)]).then(([s,a])=>{o||Pm(r,s,a)}).catch(s=>console.error(s)),ce(()=>{o=!0})}),(()=>{var r=cm(),n=r.firstChild,i=n.nextSibling,o=i.nextSibling,s=o.firstChild;return _(s,(()=>{var a=ft(()=>!!t.backdropUrl);return()=>a()?(()=>{var c=um(),u=e;return typeof u=="function"?we(u,c):e=c,c})():dm()})()),r})()}function ym(t){const e=()=>({"--tooltip-bg":t.backgroundUrl?`url("${t.backgroundUrl}")`:"","--tooltip-border":t.borderImageUrl?`url("${t.borderImageUrl}")`:""});return(()=>{var r=fm(),n=r.firstChild,i=n.nextSibling,o=i.nextSibling,s=o.firstChild,a=s.firstChild,c=a.nextSibling,u=c.nextSibling,l=u.firstChild,d=l.firstChild,g=l.nextSibling,f=g.firstChild,h=g.nextSibling,v=h.firstChild;return me(S=>{var p=e(),w=t.goldIconUrl,m=t.lumberIconUrl,U=t.supplyIconUrl;return S.e=Ji(s,p,S.e),w!==S.t&&le(d,"src",S.t=w),m!==S.a&&le(f,"src",S.a=m),U!==S.o&&le(v,"src",S.o=U),S},{e:void 0,t:void 0,a:void 0,o:void 0}),r})()}function Um(){const t=()=>Pt(),e=()=>Ut[t()].tile,r=()=>`/console/${t()}/${e()}UIPortraitFrameCrop.png`,n=()=>`/console/${t()}/${e()}UIPortraitWindowMask.png`;return(()=>{var i=hm(),o=i.firstChild,s=o.nextSibling,a=s.nextSibling,c=a.firstChild,u=c.firstChild,l=u.firstChild,d=l.nextSibling,g=c.nextSibling,f=g.firstChild,h=f.nextSibling;return h.nextSibling,_(l,ue(Qg,{get race(){return t()}})),_(g,t,h),me(v=>{var S=`url("${n()}")`,p=r();return S!==v.e&&ie(l,"--portrait-window-mask",v.e=S),p!==v.t&&le(d,"src",v.t=p),v},{e:void 0,t:void 0}),i})()}function Cm(t){return(()=>{var e=gm(),r=e.firstChild;return r.nextSibling,_(e,()=>t.children,null),e})()}var Bm=Y('<div class="token-swatch token-swatch--editbox-canvas"><canvas class=token-swatch-canvas></canvas><span class=token-hex>'),Em=Y('<section class=section-card><h3>Design Tokens</h3><p class=section-desc>60+ design tokens per faction. Stone textures, gold gradients, border filigree — all overridable. Your brand guidelines say blue and white? We can work with that. But why would you.</p><div class=token-grid><div class=token-grid-header><div></div></div></div><p class=token-caption><em>"We extracted every pixel from the original UI. Twice."'),Am=Y("<div class=token-faction-label>"),Mm=Y("<div class=token-grid-row><div class=token-name>");const _m=[{label:"Background"},{label:"Text"},{label:"Accent"},{label:"Glow"}],ra=[{name:"Human",colors:["#2a2a3a","#eceff7","#4a7abf","#6db3f2"]},{name:"Orc",colors:["#2a1f1a","#f0e0c0","#bf4a4a","#ff6644"]},{name:"Night Elf",colors:["#1a2a2a","#d0e8e0","#4abfaa","#44ffcc"]},{name:"Undead",colors:["#1a1a2a","#c8c0d0","#6a4abf","#8866ff"]}],Dm=.032/.04,Lm=.004/.04,na=new Map;function Rm(t){const e=na.get(t);if(e)return e;const r=new Promise((n,i)=>{const o=new Image;o.onload=()=>n(o),o.onerror=()=>i(new Error(`Failed to load image ${t}`)),o.src=t});return na.set(t,r),r}function ia(t,e,r,n){const i=document.createElement("canvas");i.width=n,i.height=r;const o=i.getContext("2d");return o&&(o.translate(n,0),o.rotate(Math.PI/2),o.drawImage(t,e*r,0,r,n,0,0,r,n)),i}function oa(t,e,r,n,i,o){if(i<=0||o<=0)return;let s=0;for(;s<i;){const a=Math.min(o,i-s),c=a/o*e.width;t.drawImage(e,0,0,c,e.height,r+s,n,a,o),s+=a}}function Fm(t,e,r,n,i,o){const s=Math.max(0,Math.min(o,n*.5,i*.5));if(s<=0){t.fillRect(e,r,n,i);return}t.beginPath(),t.moveTo(e+s,r),t.lineTo(e+n-s,r),t.quadraticCurveTo(e+n,r,e+n,r+s),t.lineTo(e+n,r+i-s),t.quadraticCurveTo(e+n,r+i,e+n-s,r+i),t.lineTo(e+s,r+i),t.quadraticCurveTo(e,r+i,e,r+i-s),t.lineTo(e,r+s),t.quadraticCurveTo(e,r,e+s,r),t.closePath(),t.fill()}function $m(t,e,r){const n=Math.max(1,t.clientWidth||1),i=Math.max(1,t.clientHeight||1),o=window.devicePixelRatio||1,s=Math.max(1,Math.round(n*o)),a=Math.max(1,Math.round(i*o));(t.width!==s||t.height!==a)&&(t.width=s,t.height=a);const c=t.getContext("2d");if(!c)return;c.setTransform(o,0,0,o,0,0),c.clearRect(0,0,n,i),c.imageSmoothingEnabled=!0;const u=e.width,l=e.height,d=u/8,g=Math.max(1,Math.floor(Math.min(d,l))),f=Math.max(1,Math.floor(Math.min(i*Dm,g,n/2,i/2))),v=Math.max(0,Math.floor(Math.min(i*Lm,n/2,i/2)))+Math.max(1,Math.floor(i*.02)),S=v,p=v,w=Math.max(0,n-v*2),m=Math.max(0,i-v*2),U=Math.max(1,Math.floor(f*.42));w>0&&m>0&&(c.save(),c.globalAlpha=.88,c.fillStyle=r,Fm(c,S,p,w,m,U),c.restore());const x=(T,P,k,L,N)=>{c.drawImage(e,T*d,0,d,l,P,k,L,N)};x(4,0,0,f,f),x(5,n-f,0,f,f),x(6,0,i-f,f,f),x(7,n-f,i-f,f,f);const b=i-f*2;b>0&&(x(0,0,f,f,b),x(1,n-f,f,f,b));const y=n-f*2;if(y>0){const T=ia(e,2,d,l),P=ia(e,3,d,l);oa(c,T,f,0,y,f),oa(c,P,f,i-f,y,f)}}function Vm(t){const e=t.replace("#",""),r=e.length===3?e.split("").map(a=>`${a}${a}`).join(""):e.padEnd(6,"0").slice(0,6),n=parseInt(r.slice(0,2),16),i=parseInt(r.slice(2,4),16),o=parseInt(r.slice(4,6),16);return(n*299+i*587+o*114)/1e3>160?"#10151f":"#f5f8ff"}function km(t){let e,r=0,n=!1;const i=async()=>{const o=e;if(!o||n)return;const s=t.color,a=t.borderAtlasUrl,c=++r;if(!a){const u=o.getContext("2d");if(!u)return;const l=Math.max(1,o.clientWidth||1),d=Math.max(1,o.clientHeight||1),g=window.devicePixelRatio||1,f=Math.max(1,Math.round(l*g)),h=Math.max(1,Math.round(d*g));(o.width!==f||o.height!==h)&&(o.width=f,o.height=h),u.setTransform(g,0,0,g,0,0),u.clearRect(0,0,l,d),u.fillStyle=s,u.fillRect(0,0,l,d);return}try{const u=await Rm(a);if(n||c!==r)return;$m(o,u,s)}catch(u){console.error(u)}};return de(()=>{t.color,t.borderAtlasUrl,i()}),Xt(()=>{const o=new ResizeObserver(()=>{i()});o.observe(e),ce(()=>{n=!0,o.disconnect()})}),(()=>{var o=Bm(),s=o.firstChild,a=s.nextSibling,c=e;return typeof c=="function"?we(c,s):e=s,_(a,()=>t.color),me(u=>ie(a,"--token-hex-color",t.textColor)),o})()}function Im(t){return(()=>{var e=Em(),r=e.firstChild,n=r.nextSibling,i=n.nextSibling,o=i.firstChild;return o.firstChild,_(o,()=>ra.map(s=>(()=>{var a=Am();return _(a,()=>s.name),a})()),null),_(i,()=>_m.map((s,a)=>(()=>{var c=Mm(),u=c.firstChild;return _(u,()=>s.label),_(c,()=>ra.map(l=>{const d=l.colors[a].toUpperCase();return ue(km,{color:d,get textColor(){return Vm(d)},get borderAtlasUrl(){return t.borderAtlasUrls[l.name]}})}),null),c})()),null),e})()}var Gm=Y("<section class=section-card><h3>Forged for everyone.</h3><p class=section-desc>All components meet WCAG 2.1 AA contrast ratios — even the Undead theme. Full keyboard navigation, screen reader labels, and reduced-motion support are built in, not bolted on.</p><div class=a11y-checklist>"),Nm=Y("<span class=a11y-check-item><span class=a11y-check-icon>&#10003;</span> ");const Om=["Keyboard navigable","ARIA labels","Reduced motion","Colour contrast AA","Focus-visible rings (faction-styled, of course)"];function Hm(){return(()=>{var t=Gm(),e=t.firstChild,r=e.nextSibling,n=r.nextSibling;return _(n,()=>Om.map(i=>(()=>{var o=Nm(),s=o.firstChild;return s.nextSibling,_(o,i,null),o})())),t})()}var zm=Y("<canvas class=bundle-chart-bar-canvas>"),Xm=Y("<section class=section-card><h3>Leaner than a Blademaster with Wind Walk.</h3><p class=section-desc>Tree-shakeable ESM. Import only what you need. Average component weighs under 1.4kb gzipped.</p><div class=bundle-chart>"),Wm=Y("<div class=bundle-chart-row><span class=bundle-chart-label></span><div class=bundle-chart-bar-track></div><span class=bundle-chart-size>kb");const bl=[{name:"GoldButton",size:1.2},{name:"ResourceCounter",size:.8},{name:"CommandCard",size:1.9},{name:"Tooltip",size:1.4},{name:"PortraitFrame",size:1.1},{name:"HealthBar",size:.6},{name:"Minimap",size:2.1},{name:"Dialog",size:1.7},{name:"ChatBubble",size:.9},{name:"HeroCard",size:2.4}],qm=Math.max(...bl.map(t=>t.size)),sa=new Map,Ym="/models/build-progress/BuildProgressBar.mdx",Vi=4/128;let Cn=null;function Km(t){return t.replace(/\\/g,"/").toLowerCase()}async function Qm(){return Cn||(Cn=(async()=>{const t={minU:0,maxU:1};try{const e=await fetch(Ym);if(!e.ok)return t;const r=await e.arrayBuffer(),n=Hn(r),o=(n.Textures||[]).findIndex(f=>Km(String(f?.Image||"")).endsWith("/human-buildprogressbar-border2.blp"));if(o<0)return t;const a=(n.Materials||[]).findIndex(f=>(f?.Layers||[]).some(h=>h?.TextureID===o));if(a<0)return t;const l=(n.Geosets||[]).find(f=>f.MaterialID===a)?.TVertices?.[0];if(!l||l.length<2)return t;let d=1/0,g=-1/0;for(let f=0;f<l.length;f+=2){const h=l[f];h<d&&(d=h),h>g&&(g=h)}return!Number.isFinite(d)||!Number.isFinite(g)||g<=d?t:{minU:d,maxU:g}}catch(e){return console.warn("Failed to load BuildProgressBar UV domain, falling back to texture-domain caps.",e),t}})(),Cn)}async function aa(t){const e=sa.get(t);if(e)return e;const r=new Promise((n,i)=>{const o=new Image;o.onload=()=>n(o),o.onerror=()=>i(new Error(`Failed to load image ${t}`)),o.src=t});return sa.set(t,r),r}function Zm(t,e){const r=t.width,n=t.height;if(r<=2||n<=0)return Vi;const i=document.createElement("canvas");i.width=r,i.height=n;const o=i.getContext("2d",{willReadFrequently:!0});if(!o)return Vi;o.clearRect(0,0,r,n),o.drawImage(t,0,0);const s=o.getImageData(0,0,r,n).data,a=Math.floor(n/2),c=h=>s[(a*r+h)*4+3];let u=0;for(;u<r&&c(u)===0;)u+=1;let l=u;for(;l<r&&c(l)!==0;)l+=1;if(l<=u||l>=r)return Vi;const d=Math.max(1e-6,e.maxU-e.minU),f=(l/r-e.minU)/d;return Math.max(1/r,Math.min(.45,f))}function la(t,e,r,n,i,o,s){if(i<=0||o<=0)return;const a=e.width,c=e.height,u=Math.min(s,Math.floor(a/2)),l=Math.min(u,Math.floor(i/2));l>0&&t.drawImage(e,0,0,u,c,r,n,l,o);const d=i-l*2;if(d>0){const g=u,f=Math.max(1,a-u*2);t.drawImage(e,g,0,f,c,r+l,n,d,o)}l>0&&t.drawImage(e,a-u,0,u,c,r+i-l,n,l,o)}function jm(t,e,r,n,i){const o=t.getBoundingClientRect(),s=Math.max(1,o.width),a=Math.max(1,o.height),c=window.devicePixelRatio||1,u=Math.max(1,Math.round(s*c)),l=Math.max(1,Math.round(a*c));(t.width!==u||t.height!==l)&&(t.width=u,t.height=l);const d=t.getContext("2d");if(!d)return;d.setTransform(c,0,0,c,0,0),d.clearRect(0,0,s,a),d.imageSmoothingEnabled=!0;const g=Math.max(1,Math.round(s*i)),f=Math.max(0,Math.min(s,n/100*s));f>0&&la(d,e,0,0,f,a,g),la(d,r,0,0,s,a,g)}function Jm(t){let e,r=0,n=!1;const i=async()=>{const o=e;if(!o||n)return;const s=t.fillUrl(),a=t.borderUrl(),c=++r;if(!s||!a){const u=o.getContext("2d");u&&u.clearRect(0,0,o.width,o.height);return}try{const[u,l,d]=await Promise.all([aa(s),aa(a),Qm()]);if(n||c!==r)return;const g=Zm(l,d);jm(o,u,l,t.valuePct,g)}catch(u){console.error(u)}};return de(()=>{t.valuePct,t.fillUrl(),t.borderUrl(),i()}),Xt(()=>{const o=new ResizeObserver(()=>{i()});o.observe(e),ce(()=>{n=!0,o.disconnect()})}),(()=>{var o=zm(),s=e;return typeof s=="function"?we(s,o):e=o,o})()}function ep(t){return(()=>{var e=Xm(),r=e.firstChild,n=r.nextSibling,i=n.nextSibling;return _(i,()=>bl.map(o=>(()=>{var s=Wm(),a=s.firstChild,c=a.nextSibling,u=c.nextSibling,l=u.firstChild;return _(a,()=>o.name),_(c,ue(Jm,{get valuePct(){return o.size/qm*100},get fillUrl(){return t.buildFillUrl},get borderUrl(){return t.buildBorderUrl}})),_(u,()=>o.size,l),s})())),e})()}var tp=Y('<section class="section-card faq-section"><h3>FAQ</h3><div class=faq-list>'),rp=Y("<div class=faq-item><h4 class=faq-question-heading></h4><p class=faq-answer-text>");const np=[{q:"Is this an official Blizzard product?",a:"No. This is an independent open-source project. Blizzard Entertainment has no affiliation. All visual assets are recreated from scratch."},{q:"Does it work with Tailwind?",a:"Yes. WC3UI uses CSS custom properties internally. Tailwind utility classes compose cleanly alongside faction themes."},{q:"Can I use it in production?",a:"We've been in beta since the Reign of Chaos launch. So, technically, it's battle-tested."},{q:"Why is there no Blood Elf theme?",a:"That's a TBC problem. We're tracking it in issue #247."}];function ip(){return(()=>{var t=tp(),e=t.firstChild,r=e.nextSibling;return _(r,()=>np.map(n=>(()=>{var i=rp(),o=i.firstChild,s=o.nextSibling;return _(o,()=>n.q),_(s,()=>n.a),i})())),t})()}var op=Y("<canvas style=position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none>");const xl={Human:{modelPath:"/models/worker-units/Human/peasant.mdx",textures:{"textures/peasant.blp":"/models/worker-units/textures/Peasant.blp","textures/gutz.blp":"/models/worker-units/textures/gutz.blp"}},Orc:{modelPath:"/models/worker-units/Orc/peon.mdx",textures:{"units/orc/peon/peon.blp":"/models/worker-units/Orc/peon.blp","textures/gutz.blp":"/models/worker-units/textures/gutz.blp"}},NightElf:{modelPath:"/models/worker-units/NightElf/Archer.mdx",textures:{"textures/ranger.blp":"/models/worker-units/textures/Ranger.blp","textures/star2_32.blp":"/models/worker-units/textures/star2_32.blp","textures/gutz.blp":"/models/worker-units/textures/gutz.blp"}},Undead:{modelPath:"/models/worker-units/Undead/Acolyte.mdx",textures:{"textures/acolyte.blp":"/models/worker-units/textures/Acolyte.blp","textures/green_star.blp":"/models/worker-units/textures/Green_Star.blp","textures/demonrune3.blp":"/models/worker-units/textures/DemonRune3.blp","textures/gutz.blp":"/models/worker-units/textures/gutz.blp"}}},ca=new Map,ua=new Map;function sp(t){return t.replaceAll("\\","/").toLowerCase()}function ap(t,e){const r=sp(t);if(!r)return null;const n=xl[e].textures[r];return n||null}async function lp(t){const e=ca.get(t);if(e)return e;const r=await fetch(t);if(!r.ok)throw new Error(`Failed to load worker unit model: ${t}`);const n=await r.arrayBuffer(),i=Hn(n);return ca.set(t,i),i}async function cp(t){const e=ua.get(t);if(e)return e;const r=await fetch(t);if(!r.ok)throw new Error(`Failed to load worker unit texture: ${t}`);const n=await r.arrayBuffer(),i=rn(n),o=[],s=Math.max(1,Math.floor(Math.log2(Math.max(i.width,i.height)))+1);for(let a=0;a<s;a++){const c=i.width>>a,u=i.height>>a;if(c<=0||u<=0)break;try{const l=nn(i,a);if(!l||!l.width||!l.height||(o.push(new ImageData(l.data,l.width,l.height)),l.width===1&&l.height===1))break}catch{break}}if(o.length===0)throw new Error(`No mip levels decoded for worker unit texture: ${t}`);return ua.set(t,o),o}function up(t,e){const r=t.Sequences||[];if(r.length===0)return 0;const n=r.map(a=>(a.Name||"").toLowerCase()),o={Human:["stand work","stand lumber","stand ready","stand gold","stand - 3","stand -3","stand 2","stand - 2","stand"],Orc:["stand ready","stand - stretch","stand - itch head","stand - talk gesture","stand 2","stand - 2","stand"],NightElf:["stand ready","stand - 3","stand -3","stand 2","stand - 2","stand"],Undead:["stand work","stand 2","stand - 2","stand ready","stand"]}[e];for(const a of o){const c=n.findIndex(u=>u.includes(a));if(c>=0)return c}const s=n.findIndex(a=>a.includes("stand")&&!a.includes("death")&&!a.includes("decay"));return s>=0?s:0}function dp(t,e){const r=t.Sequences?.[e],n=r?.Interval?.[0]??0,i=r?.Interval?.[1]??n+1e3;return{start:n,length:Math.max(1,i-n)}}function fp(t,e){const r=t.Sequences?.[e],n=r?.MinimumExtent,i=r?.MaximumExtent;if(n&&i)return{min:[n[0],n[1],n[2]],max:[i[0],i[1],i[2]]};const o=t.Info?.MinimumExtent,s=t.Info?.MaximumExtent;return o&&s?{min:[o[0],o[1],o[2]],max:[s[0],s[1],s[2]]}:{min:null,max:null}}function da(t){let e,r=null,n=null,i=null,o=0,s=!1,a=0,c=0,u=0,l=1e3,d=0;const g=ar(),f=ar(),h=ar(),v=$r(),S=$r(),p=Nn();let w=.78,m=8,U=2400;const x=()=>{if(n)try{n.destroy()}catch(L){console.warn("worker unit renderer destroy failed",L)}finally{n=null}},b=()=>{if(!e)return;const L=Math.max(1e-6,e.clientWidth/Math.max(1,e.clientHeight));gl(f,w,L,m,U)},y=()=>{if(!e||!r)return;const L=window.devicePixelRatio||1,N=Math.max(1,Math.round(e.clientWidth*L)),D=Math.max(1,Math.round(e.clientHeight*L));(e.width!==N||e.height!==D)&&(e.width=N,e.height=D),r.viewport(0,0,N,D),b()},T=(L,N)=>{const D=fp(L,N),V=D.min,$=D.max;if(V&&$){const I=(V[0]+$[0])*.5,pe=(V[1]+$[1])*.5,K=(V[2]+$[2])*.5,Te=$[0]-V[0],Ie=$[1]-V[1],Le=$[2]-V[2],Oe=Math.hypot(Te,Ie,Le)*.5,Fe=Math.min(190,Math.max(100,Oe)),ze=Math.min(220,Math.max(90,Le)),Xe=Fe*.42;Vt(v,I+Xe,pe-Fe*2.25,K+ze*.62),Vt(S,I,pe,K+ze*.18),w=.86,m=Math.max(8,Fe*.08),U=Math.max(m+300,Fe*11.5)}else Vt(v,48,-420,180),Vt(S,0,0,100),w=.78,m=8,U=2200;if(Yi(g,v,S,kt(0,0,1)),hl(h,g)){const I=io();dl(I,h),oo(p,I),Xn(p,p)}else ml(p)},P=()=>{const N=D=>{if(s||(o=requestAnimationFrame(N),!r||!n))return;y();const V=(D-d)*.8,$=u+V%l;n.setSequence(c),n.setFrame($),n.update(0),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT),n.render(g,f,{env:!1,wireframe:!1})};o=requestAnimationFrame(N)},k=async(L,N)=>{const D=++a,V=xl[L],$=await lp(V.modelPath);if(s||D!==a||!r)return;x(),n=new no($),n.initGL(r),c=up($,L);const I=dp($,c);u=I.start,l=I.length,T($,c),n.setCamera(v,p),n.setLightPosition(v),n.setLightColor(kt(1,1,1)),n.setSequence(c),d=performance.now();const pe=($.Textures||[]).map(async K=>{const Te=ap(K.Image,L);if(Te)try{const Ie=await cp(Te);!s&&D===a&&n.setTextureImageData(K.Image,Ie)}catch(Ie){console.warn(`failed to load worker texture ${Te}`,Ie)}});await Promise.all(pe)};return Xt(()=>{r=e.getContext("webgl2",{alpha:!0,premultipliedAlpha:!1,antialias:!0,depth:!0,stencil:!1}),r||(r=e.getContext("webgl",{alpha:!0,premultipliedAlpha:!1,antialias:!0,depth:!0,stencil:!1})),r&&(y(),i=new ResizeObserver(()=>y()),i.observe(e),P(),k(t.race,t.side).catch(L=>console.error(L)))}),de(()=>{const L=t.race;t.side,r&&k(L).catch(N=>console.error(N))}),ce(()=>{s=!0,a++,cancelAnimationFrame(o),i?.disconnect(),x()}),(()=>{var L=op(),N=e;return typeof N=="function"?we(N,L):e=L,L})()}var hp=Y('<footer class=site-footer><div class="footer-worker-unit footer-worker-unit--left"aria-hidden=true></div><div class="footer-worker-unit footer-worker-unit--right"aria-hidden=true></div><div class=footer-content><p class=footer-links>WC3UI is open source under MIT · <a href=#>GitHub</a> · <a href=#>Discord</a> · <a href=#>Changelog</a></p><p class=footer-joke><em>"My life for Aiur!"</em> — wait, wrong game.</p><p class=footer-signoff>banteg 2026');function gp(t){const e=()=>t.race==="Orc"?20:t.race==="NightElf"?15:t.race==="Undead"?-30:0;return(()=>{var r=hp(),n=r.firstChild,i=n.nextSibling;return _(n,ue(da,{get race(){return t.race},side:"left"})),_(i,ue(da,{get race(){return t.race},side:"right"})),me(o=>{var s=`${e()}px`,a=`${e()}px`;return s!==o.e&&ie(n,"--footer-worker-y-offset",o.e=s),a!==o.t&&ie(i,"--footer-worker-y-offset",o.t=a),o},{e:void 0,t:void 0}),r})()}const Ki=[{title:"Menu",desc:"Race-specific nine-slice panel and button borders from the options menu.",entries:[{path:"/buttons/esc/human/human-options-menu-border.blp",label:"Human"},{path:"/buttons/esc/orc/orc-options-menu-border.blp",label:"Orc"},{path:"/buttons/esc/nightelf/nightelf-options-menu-border.blp",label:"Night Elf"},{path:"/buttons/esc/undead/undead-options-menu-border.blp",label:"Undead"}]},{title:"Cinematic",desc:"Letterbox borders for in-game cinematics.",entries:[{path:"/borders/esc/human-cinematic-border.blp",label:"Human"},{path:"/borders/esc/orc-cinematic-border.blp",label:"Orc"},{path:"/borders/esc/nightelf-cinematic-border.blp",label:"Night Elf"},{path:"/borders/esc/undead-cinematic-border.blp",label:"Undead"}]}],fa=Ki.flatMap(t=>t.entries.map(e=>e.path));var mp=Y("<div class=tab-content><div class=section-card><h2>Border Textures</h2><p class=section-desc>All <!> border BLP textures across <!> categories. These 9-slice atlases, bar borders, and panel borders define the chrome around every UI element."),pp=Y("<div class=borders-loading>Decoding border textures…"),vp=Y("<div class=borders-category><h4 class=borders-category-title></h4><p class=borders-category-desc></p><div class=borders-grid>"),bp=Y("<div class=border-item><img class=border-thumbnail><div class=border-label>");const ha=new Map;function xp(t){const e=t.width/Math.max(1,t.height);return e>=7.25&&e<=8.75&&t.width>=64&&t.height>=8}async function Sp(t){const e=ha.get(t);if(e)return e;const r=new Promise((n,i)=>{const o=new Image;o.onload=()=>n(o),o.onerror=()=>i(new Error(`Failed to load image ${t}`)),o.src=t});return ha.set(t,r),r}function ga(t,e,r,n){const i=document.createElement("canvas");i.width=n,i.height=r;const o=i.getContext("2d");return o&&(o.translate(n,0),o.rotate(Math.PI/2),o.drawImage(t,e*r,0,r,n,0,0,r,n)),i}function ma(t,e,r,n,i,o){if(i<=0||o<=0)return;let s=0;for(;s<i;){const a=Math.min(o,i-s),c=a/o*e.width;t.drawImage(e,0,0,c,e.height,r+s,n,a,o),s+=a}}function pa(t,e,r,n,i,o,s,a,c){if(a<=0||c<=0)return;let u=0;for(;u<c;){const l=Math.min(a,c-u),d=l/a*i;t.drawImage(e,r*n,0,n,d,o,s+u,a,l),u+=l}}function wp(t,e){const o=Math.floor(37),s=Math.floor(14/2),a=2,c=document.createElement("canvas");c.width=156*a,c.height=96*a;const u=c.getContext("2d");if(!u)return"";u.setTransform(a,0,0,a,0,0),u.clearRect(0,0,156,96),u.imageSmoothingEnabled=!0;const l=t.width,d=t.height,g=l/8,f=Math.max(4,Math.floor(Math.min(d*.8,82/3))),h=(p,w,m,U,x)=>{u.drawImage(t,p*g,0,g,d,w,m,U,x)};h(4,o,s,f,f),h(5,o+82-f,s,f,f),h(6,o,s+82-f,f,f),h(7,o+82-f,s+82-f,f,f);const v=82-f*2;!e&&v>0&&(pa(u,t,0,g,d,o,s+f,f,v),pa(u,t,1,g,d,o+82-f,s+f,f,v));const S=82-f*2;if(S>0){const p=ga(t,2,g,d),w=ga(t,3,g,d);ma(u,p,o+f,s,S,f),ma(u,w,o+f,s+82-f,S,f)}return c.toDataURL("image/png")}function Pp(t){return t.toLowerCase().includes("cinematic")}async function Tp(t,e){const r=await Sp(e);return xp(r)&&wp(r,Pp(t))||e}function yp(t){const[e,r]=C({}),[n,i]=C(!0);return Xt(async()=>{const o=await Promise.all(fa.map(async a=>{try{const c=await t.loadBlpDataUrl(a),u=await Tp(a,c);return[a,{previewUrl:u}]}catch(c){return console.warn(`[BordersSection] failed to load ${a}`,c),null}})),s={};for(const a of o)a&&(s[a[0]]=a[1]);r(s),i(!1)}),(()=>{var o=mp(),s=o.firstChild,a=s.firstChild,c=a.nextSibling,u=c.firstChild,l=u.nextSibling,d=l.nextSibling,g=d.nextSibling;return g.nextSibling,_(c,()=>fa.length,l),_(c,()=>Ki.length,g),_(s,ue(vs,{get when(){return!n()},get fallback(){return pp()},get children(){return ue(kn,{each:Ki,children:f=>(()=>{var h=vp(),v=h.firstChild,S=v.nextSibling,p=S.nextSibling;return _(v,()=>f.title),_(S,()=>f.desc),_(p,ue(kn,{get each(){return f.entries},children:w=>{const m=()=>e()[w.path];return ue(vs,{get when(){return m()},get children(){var U=bp(),x=U.firstChild,b=x.nextSibling;return _(b,()=>w.label),me(y=>{var T=m().previewUrl,P=w.label;return T!==y.e&&le(x,"src",y.e=T),P!==y.t&&le(x,"alt",y.t=P),y},{e:void 0,t:void 0}),U}})}})),h})()})}}),null),o})()}var Up=Y('<div class=button-preview-col><div class=menu-frame-variant-shell><button type=button class="menu-button-inner menu-frame-variant-inner"><canvas class=menu-button-canvas></canvas><span class=menu-button-label></span></button></div><div class=button-state-label>'),Cp=Y("<img alt class=menu-frame-variant-image>"),Bp=Y("<span class=button-hotkey>"),Ep=Y('<div class=button-preview-row><div class=button-preview-col><button type=button class=top-tab-preview><div style="position:absolute;inset:0;background-repeat:no-repeat;background-size:150.58823529411765% 581.8181818181819%"></div><div style="position:absolute;inset:0;background-repeat:no-repeat;background-size:150.58823529411765% 581.8181818181819%;transition:opacity 80ms linear;pointer-events:none;mix-blend-mode:screen"></div><span style=position:relative></span></button><div class=button-state-label>Normal</div></div><div class=button-preview-col><button type=button class=top-tab-preview><div style="position:absolute;inset:0;background-repeat:no-repeat;background-size:150.58823529411765% 581.8181818181819%"></div><span style=position:relative;color:#ffd412></span></button><div class=button-state-label>Active</div></div><div class=button-preview-col><button type=button class=top-tab-preview disabled style=opacity:0.5><div style="position:absolute;inset:0;background-repeat:no-repeat;background-size:150.58823529411765% 581.8181818181819%"></div><span style=position:relative;color:#808080></span></button><div class=button-state-label>Disabled'),Ap=Y('<div class=option-button-row><div class=button-preview-col><button type=button class=esc-option-preview><canvas class=esc-option-canvas></canvas><span class=esc-option-label>Options</span></button><div class=button-state-label>Normal</div></div><div class=button-preview-col><button type=button class=esc-option-preview disabled><canvas class=esc-option-canvas></canvas><span class="esc-option-label esc-option-label-disabled">Options</span></button><div class=button-state-label>Disabled'),Mp=Y("<div class=menu-button-showcase><div class=button-preview-col><div class=menu-button-shell><img alt class=menu-button-frame><button type=button class=menu-button-inner><canvas class=menu-button-canvas></canvas><span class=menu-button-label><span class=button-hotkey>S</span>ingle Player</span></button></div><div class=button-state-label>Normal</div></div><div class=button-preview-col><div class=menu-button-shell><img alt class=menu-button-frame><button type=button class=menu-button-inner disabled><canvas class=menu-button-canvas></canvas><span class=menu-button-label style=color:#808080>Single Player</span></button></div><div class=button-state-label>Disabled"),_p=Y('<div class=menu-button-showcase><div class=button-preview-col><div class=menu-button-shell><img alt class=menu-button-frame><button type=button class="menu-button-inner menu-button-inner--single"><canvas class=menu-button-canvas></canvas><span class=menu-button-label><span class=button-hotkey>O</span>K</span></button></div><div class=button-state-label>Normal</div></div><div class=button-preview-col><div class=menu-button-shell><img alt class=menu-button-frame><button type=button class="menu-button-inner menu-button-inner--single"disabled><canvas class=menu-button-canvas></canvas><span class=menu-button-label style=color:#808080>OK</span></button></div><div class=button-state-label>Disabled'),Dp=Y("<div class=menu-frame-variant-grid>"),Lp=Y("<div class=glue-screen-showcase><div class=button-preview-col><button type=button class=glue-screen-button><canvas class=glue-screen-canvas></canvas><span><span class=button-hotkey>S</span>ingle Player</span></button><div class=button-state-label>Normal</div></div><div class=button-preview-col><button type=button class=glue-screen-button disabled><canvas class=glue-screen-canvas></canvas><span style=color:#808080>Single Player</span></button><div class=button-state-label>Disabled"),Rp=Y("<div class=glue-screen-showcase><div class=button-preview-col><button type=button class=glue-screen-button><canvas class=glue-screen-canvas></canvas><span><span class=button-hotkey>R</span>eplay</span></button><div class=button-state-label>Normal</div></div><div class=button-preview-col><button type=button class=glue-screen-button disabled><canvas class=glue-screen-canvas></canvas><span style=color:#808080>Replay</span></button><div class=button-state-label>Disabled"),Fp=Y("<div class=button-preview-row><div class=button-preview-col><button type=button class=glue-small-button><canvas class=glue-screen-canvas></canvas><span>OK</span></button><div class=button-state-label>Normal</div></div><div class=button-preview-col><button type=button class=glue-small-button disabled><canvas class=glue-screen-canvas></canvas><span style=color:#808080>OK</span></button><div class=button-state-label>Disabled"),$p=Y("<div class=button-preview-row><div class=button-preview-col><button type=button class=campaign-button><canvas class=glue-screen-canvas></canvas><span><span class=button-hotkey>C</span>ampaign</span></button><div class=button-state-label>Normal</div></div><div class=button-preview-col><button type=button class=campaign-button disabled><canvas class=glue-screen-canvas></canvas><span style=color:#808080>Campaign</span></button><div class=button-state-label>Disabled"),Vp=Y('<div class=button-preview-row><div class=button-preview-col><button type=button class="cmd-btn cmd-btn--showcase"aria-label="Holy Bolt (Q)"aria-keyshortcuts=Q><img alt class=cmd-btn-icon><div class=cmd-btn-highlight></div><span class=cmd-btn-hotkey aria-hidden=true>Q</span></button><div class=button-state-label>Interactive</div></div><div class=button-preview-col><button type=button class="cmd-btn cmd-btn--showcase"aria-label="Holy Bolt active autocast (Q)"aria-keyshortcuts=Q aria-pressed=true tabindex=-1 style=cursor:default><img alt class=cmd-btn-icon><div class="cmd-btn-highlight cmd-btn-highlight--on"></div><span class=cmd-btn-hotkey aria-hidden=true>Q</span></button><div class=button-state-label>Active</div></div><div class=button-preview-col><button type=button class="cmd-btn cmd-btn--showcase cmd-btn--pressed"aria-label="Holy Bolt pressed (Q)"aria-keyshortcuts=Q tabindex=-1 style=cursor:default><img alt class=cmd-btn-icon><span class=cmd-btn-hotkey aria-hidden=true>Q</span></button><div class=button-state-label>Pressed</div></div><div class=button-preview-col><button type=button class="cmd-btn cmd-btn--showcase"aria-label="Holy Bolt disabled (Q)"aria-keyshortcuts=Q disabled><img alt class=cmd-btn-icon><span class=cmd-btn-hotkey aria-hidden=true>Q</span></button><div class=button-state-label>Disabled</div></div><div class=button-preview-col><button type=button class="cmd-btn cmd-btn--showcase"aria-label="Holy Bolt cooling down (Q)"aria-keyshortcuts=Q aria-busy=true disabled><img alt class=cmd-btn-icon><div class=cmd-btn-cooldown></div><span class=cmd-btn-hotkey aria-hidden=true>Q</span></button><div class=button-state-label>Cooldown</div></div><div class=button-preview-col><button type=button class="cmd-btn cmd-btn--showcase cmd-btn--no-resources"aria-label="Holy Bolt unavailable: insufficient mana (Q)"aria-keyshortcuts=Q disabled><img alt class=cmd-btn-icon><div class=cmd-btn-no-resources></div><span class=cmd-btn-hotkey aria-hidden=true>Q</span></button><div class=button-state-label>No Resources'),ki=Y("<div class=button-showcase-grid>"),kp=Y('<div class=button-preview-row><div class=button-preview-col><div class=popup-trigger-anchor><button type=button class=popup-trigger-button aria-haspopup=listbox><canvas class=popup-trigger-canvas></canvas><span class=popup-title-text></span><img alt class=popup-arrow-icon></button></div><div class=button-state-label>Interactive</div></div><div class=button-preview-col><button type=button class=popup-trigger-button disabled><canvas class=popup-trigger-canvas></canvas><span class="popup-title-text popup-title-text-disabled">High</span><img alt class=popup-arrow-icon></button><div class=button-state-label>Disabled'),Ip=Y('<div class=button-preview-row><div class=button-preview-col><label class=esc-slider-demo><span class=esc-slider-value>%</span><div class=esc-slider-track><canvas class=esc-slider-canvas></canvas><div class=esc-slider-knob></div><input type=range min=0 max=100 aria-label="Esc menu slider"></div></label><div class=button-state-label>Interactive</div></div><div class=button-preview-col><div class=esc-slider-demo><span class=esc-slider-value style=color:#808080>65%</span><div class=esc-slider-track><canvas class=esc-slider-canvas></canvas><div class=esc-slider-knob></div></div></div><div class=button-state-label>Disabled'),Gp=Y("<div class=button-preview-row style=justify-content:space-evenly><div class=button-preview-col><button type=button class=esc-checkbox role=checkbox><img alt></button><div class=button-state-label>Interactive</div></div><div class=button-preview-col><div class=esc-checkbox style=cursor:default><img alt><img alt></div><div class=button-state-label>Checked</div></div><div class=button-preview-col><div class=esc-checkbox style=cursor:default><img alt></div><div class=button-state-label>Unchecked</div></div><div class=button-preview-col><div class=esc-checkbox style=cursor:default><img alt><img alt></div><div class=button-state-label>Disabled Checked</div></div><div class=button-preview-col><div class=esc-checkbox style=cursor:default><img alt></div><div class=button-state-label>Disabled"),Np=Y("<div class=button-preview-row style=justify-content:space-evenly><div class=button-preview-col><div style=display:flex;gap:6px></div><div class=button-state-label>Interactive Group</div></div><div class=button-preview-col><div class=esc-radio style=cursor:default><img alt><img alt></div><div class=button-state-label>Selected</div></div><div class=button-preview-col><div class=esc-radio style=cursor:default><img alt></div><div class=button-state-label>Unselected</div></div><div class=button-preview-col><div class=esc-radio style=cursor:default><img alt><img alt></div><div class=button-state-label>Disabled Selected</div></div><div class=button-preview-col><div class=esc-radio style=cursor:default><img alt></div><div class=button-state-label>Disabled"),Op=Y('<div class=button-preview-row><div class=button-preview-col><label class="wc3-editbox wc3-editbox--esc"><canvas class=wc3-editbox-canvas></canvas><input type=text aria-label="Esc menu edit box"></label><div class=button-state-label>Esc Decorated</div></div><div class=button-preview-col><label class="wc3-editbox wc3-editbox--esc wc3-editbox--disabled"><canvas class=wc3-editbox-canvas></canvas><input type=text value=Unavailable aria-label="Esc menu edit box disabled"disabled></label><div class=button-state-label>Esc Disabled'),Hp=Y('<div class=button-preview-row><div class=button-preview-col><label class="wc3-editbox wc3-editbox--bnet"><canvas class=wc3-editbox-canvas></canvas><input type=text aria-label="Standard glue edit box"></label><div class=button-state-label>Standard (Glue/BNet)'),zp=Y('<div class=button-preview-row><div class=button-preview-col><div class=glue-scrollbar-demo><button type=button class=glue-scroll-arrow aria-label="Scroll up"><img alt></button><div class=glue-scroll-track><canvas class=glue-scroll-track-canvas></canvas><div class=glue-scroll-thumb></div><input type=range min=0 max=100 aria-label="Glue scrollbar position"></div><button type=button class=glue-scroll-arrow aria-label="Scroll down"><img alt></button></div><div class=button-state-label>Interactive</div></div><div class=button-preview-col><div class="glue-scrollbar-demo glue-scrollbar-demo--disabled"><button type=button class=glue-scroll-arrow disabled><img alt></button><div class=glue-scroll-track><canvas class=glue-scroll-track-canvas></canvas><div class=glue-scroll-thumb></div></div><button type=button class=glue-scroll-arrow disabled><img alt></button></div><div class=button-state-label>Disabled'),Xp=Y('<div class="button-preview-row button-preview-row--textarea"><div class="button-preview-col button-preview-col--textarea"><div class=esc-textarea-demo><div class=esc-textarea-shell><canvas class=esc-textarea-canvas></canvas><div class=esc-textarea-mask><div class=esc-textarea-content style=line-height:18px></div></div></div><div class=esc-textarea-scroll><canvas class=esc-textarea-scroll-canvas></canvas><div class=esc-textarea-scroll-thumb></div><input type=range min=0 max=100 aria-label="Esc text area scroll position"></div></div><div class=button-state-label>Interactive Log Panel'),Wp=Y('<div class=button-preview-row><div class=button-preview-col><div class=wc3-listbox-demo><div class=wc3-listbox-shell><canvas class=wc3-listbox-canvas></canvas><div class=wc3-listbox-mask><div class=wc3-listbox-items style=line-height:20px></div></div></div><div class=wc3-listbox-scrollbar><button type=button class=wc3-listbox-scroll-arrow aria-label="Listbox scroll up"><img alt></button><div class=wc3-listbox-scroll><canvas class=wc3-listbox-scroll-canvas></canvas><div class=wc3-listbox-scroll-thumb></div><input type=range min=0 max=100 aria-label="Listbox scroll position"></div><button type=button class=wc3-listbox-scroll-arrow aria-label="Listbox scroll down"><img alt></button></div></div><div class=button-state-label>Selectable Items'),qp=Y("<div class=button-preview-row style=justify-content:space-evenly><div class=button-preview-col><div class=resource-counter><img alt=Gold><span></span></div><div class=button-state-label>Gold</div></div><div class=button-preview-col><div class=resource-counter><img alt=Lumber><span></span></div><div class=button-state-label>Lumber</div></div><div class=button-preview-col><div class=resource-counter><img alt=Supply><span>/</span></div><div class=button-state-label>Supply</div></div><div class=button-preview-col><div class=resource-counter><span></span></div><div class=button-state-label>Upkeep"),Yp=Y('<div class="wc3-bar wc3-bar--unit wc3-bar--health"><canvas class=wc3-bar-canvas></canvas><div class=wc3-bar-text>'),va=Y("<div class=button-state-label>Model-Style"),Kp=Y('<div class="wc3-bar wc3-bar--unit wc3-bar--mana"><canvas class=wc3-bar-canvas></canvas><div class=wc3-bar-text>'),Qp=Y('<div class="wc3-bar wc3-bar--compact wc3-bar--xp"><canvas class=wc3-bar-canvas></canvas><div class=wc3-bar-text>'),Zp=Y("<div class=button-state-label>Hero XP"),jp=Y('<div class="wc3-bar wc3-bar--compact wc3-bar--progress"><canvas class=wc3-bar-canvas></canvas><div class=wc3-bar-text>'),Jp=Y("<div class=button-state-label>Timer"),ev=Y('<div class="wc3-bar wc3-bar--compact wc3-bar--build"><canvas class=wc3-bar-canvas></canvas><div class=wc3-bar-text>'),tv=Y("<div class=button-state-label>Build Time"),rv=Y("<div class=loading-preview><div class=loading-bar-composite><div class=lb-track style=left:5.859375%;right:6.4453125%;top:26.5625%;bottom:26.5625%><div class=lb-bg></div><div class=lb-fill></div></div><img class=lb-border alt><img class=lb-glass alt><img class=lb-glow alt style=left:5.919%;top:-19.58%;bottom:-19.49%><div class=lb-text>"),nv=Y("<div class=button-state-label>Model layering and geometry"),iv=Y('<div style=position:relative;width:100vw;height:100dvh;overflow:hidden><div style=position:absolute;inset:0;pointer-events:none;z-index:20><div style=position:absolute;left:0;top:0;width:100%;overflow:hidden><div style=position:absolute;display:flex;pointer-events:auto></div></div></div><div><div class="tab-content tab-content--showcase-flow"><div class="showcase-flow-item showcase-flow-item--hero"></div><div class="showcase-flow-item showcase-flow-item--faction"></div><div class="showcase-flow-item showcase-flow-item--buttons"></div><div class="showcase-flow-item showcase-flow-item--controls"></div><div class="showcase-flow-item showcase-flow-item--resource-counters"></div><div class="showcase-flow-item showcase-flow-item--command-card"></div><div class="showcase-flow-item showcase-flow-item--unit-queue"></div><div class="showcase-flow-item showcase-flow-item--tooltip"></div><div class="showcase-flow-item showcase-flow-item--portrait"></div><div class="showcase-flow-item showcase-flow-item--bars"></div><div class="showcase-flow-item showcase-flow-item--borders"></div><div class="showcase-flow-item showcase-flow-item--tokens"></div><div class="showcase-flow-item showcase-flow-item--a11y"></div><div class="showcase-flow-item showcase-flow-item--bundle"></div><div class="showcase-flow-item showcase-flow-item--faq"></div><div class="showcase-flow-item showcase-flow-item--footer">'),ov=Y('<button type=button style=position:relative;height:100%;border:none;padding:0;margin:0;background:transparent;cursor:pointer;pointer-events:auto><div style="position:absolute;inset:0;background-repeat:no-repeat;background-size:150.58823529411765% 581.8181818181819%"></div><div style="position:absolute;inset:0;background-repeat:no-repeat;background-size:150.58823529411765% 581.8181818181819%;transition:opacity 80ms linear;pointer-events:none;mix-blend-mode:screen"></div><span style="position:relative;display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-family:&quot;Friz Quadrata&quot;, &quot;Palatino Linotype&quot;, &quot;Book Antiqua&quot;, Palatino, serif;line-height:1;text-shadow:1px 1px 0 rgba(0, 0, 0, 0.95);white-space:nowrap;user-select:none">'),sv=Y('<div style="position:absolute;right:0.390625vw;top:calc(4vw * 0);width:42.28515625vw;height:calc(4vw * 0.68125);font-size:calc(4vw * 0.3125);color:#eceff7;text-shadow:0 1px 2px #000, 0 0 2px #000;font-family:&quot;Friz Quadrata&quot;, &quot;Palatino Linotype&quot;, &quot;Book Antiqua&quot;, Palatino, serif;pointer-events:none"><img alt=Gold style=position:absolute;left:0%;top:0.39062875vw;width:2.0507804999999997vw;height:2.0507804999999997vw;image-rendering:pixelated><div style=position:absolute;left:21.709007%;top:0.74062875vw;transform:translateX(-100%);line-height:1;white-space:nowrap></div><img alt=Lumber style=position:absolute;left:25.404157%;top:0.39062875vw;width:2.0507804999999997vw;height:2.0507804999999997vw;image-rendering:pixelated><div style=position:absolute;left:47.344111%;top:0.74062875vw;transform:translateX(-100%);line-height:1;white-space:nowrap></div><img alt=Supply style=position:absolute;left:51.039261%;top:0.39062875vw;width:2.0507804999999997vw;height:2.0507804999999997vw;image-rendering:pixelated><div style=position:absolute;left:72.979215%;top:0.74062875vw;transform:translateX(-100%);line-height:1;white-space:nowrap></div><div style=position:absolute;right:0.923788%;top:0.74062875vw;width:22.401848%;line-height:1;text-align:center;font-weight:700>'),av=Y("<div style=position:absolute;left:50%;top:0;transform:translateX(-50%);width:16vw;height:8vw;overflow:hidden;pointer-events:none;z-index:25>"),lv=Y("<div class=popup-menu-demo aria-label=Quality><canvas class=popup-menu-canvas>"),ba=Y("<div>"),xa=Y("<img alt>"),cv=Y("<button type=button class=esc-radio role=radio><img alt>"),uv=Y("<button type=button class=wc3-listbox-item>");const so=4,dv="clamp(30px, 9vw, 44px)",Qi=["Human","Orc","NightElf","Undead"],fv=600,Sa={Border:0,BorderSingle:1,Large:2,LargeSingle:3,Small:4,SmallSingle:5,Multiplayer:6,Tiny:7},Sl=.25,wl=0,Pl=10.625,Tl=2.75,hv=.171875,wa=.125,Pa=-.125,Dr=-2,Lr=3,gv=2,mv=2;function ao(t){return`${t/(1-hv)*100}%`}const Ii=ao(0),Gi=ao(.25),Ta=ao(.75),yl=42.875,pv=Sl/yl*100,vv=wl/so*100,bv=Pl/yl*100,xv=bv*Qi.length,Sv=Tl/so*100,wv=1500,Pv=2300,Tv=6500,yv=45e3,ya=10,Ua=99999,Uv=100,Ca=33,Sr=12e3,Cv=0,Bv=Sr/3,Ev=Sr*2/3,Av=1.23442,Mv=Sr/6,_r=8400,Ni=1e3,_v=82,Ba=90,Dv=93.631,Ea=220,Aa=28,Ma=132,_a=16,Lv=8,Rv=134,Fv=18,$v=96,Vv=16,kv=150,Ul=11,Iv=11,Gv=2,Nv=2,Da=2,Ov=Ul-2,Hv=136,Cl=16,zv=16,Xv=2,Wv=2,qv=Cl-2,Bn=6,Yv=["Low","Medium","High","Ultra"],La=[98,84,67,49,31,18,39,63,81],Ra=[92,88,72,58,44,36,51,69,83],Kv=kv-Ul-Iv,Oi=18,Fa=20,Qv=Hv-Cl-zv,En=.0125/.04,Zv=.005/.04,$a=.032/.04,jv=.004/.04,Jv=.006/.012,eb=.0025/.012,Hi=.008/.0165,zi=.004/.0165,Va=["Slow","Normal","Fast","Faster","Ludicrous","Insane","Observer","Random"],ka=["[00:31] Quest updated: Defend the village gates.","[00:42] Hint: Keep militia near the lumber line.","[00:58] Footman training complete.","[01:04] Arcane Tower construction started.","[01:12] No Upkeep active.","[01:25] Peasant assigned to Gold Mine.","[01:33] Scout report: enemy units sighted in the north.","[01:48] Town Hall upgrade queued.","[02:03] Warning: You are under attack!","[02:21] Militia duration expired.","[02:39] Lumber total reached 120.","[02:56] Defend researched at Barracks."],Ia={fillToFrameWidth:.02793/.04065,minScaleX:.037246,maxScaleX:1.44899},Ga={fillToFrameWidth:.26408/.17776,minScaleX:.014839,maxScaleX:.64512},tb={fillToFrameWidth:.26413/.10538,minScaleX:.014839,maxScaleX:.389779},Na={windWalk:"",mirrorImage:"",criticalStrike:"",bladestorm:"",skillz:"",attack:"",move:"",stop:"",holdPosition:"",patrol:""},Oa=new Map,Ha=new Map,za=new Map,Xa=new Map,Wa=new Map;function rb(t){return/\/buttons\/esc\/[^/]+\/[^/]+-options-button-background(?:-down|-disabled)?\.blp$/i.test(t)}function nb(t){return/\/resources\/Resource(?:Lumber|Supply|Human|Orc|NightElf|Undead)\.blp$/i.test(t)}function qr(t,e,r){const n=Math.max(0,Math.min(100,t)),i=r*.5,o=Math.max(i,e-r*.5);return`${(i+(o-i)*n/100)/e*100}%`}function ib(t,e,r,n){const i=Math.max(0,Math.min(100,t)),o=e+n*.5,s=Math.max(o,e+r-n*.5);return`${o+(s-o)*i/100}px`}function ob(t){const e="/buttons/esc/human/human-options-button-border-up.blp",r="/buttons/esc/human/human-options-button-border-down.blp",n="/buttons/esc/human/human-options-button-background-disabled.blp";return t==="Human"?{bg:"/buttons/esc/human/human-options-menu-background.blp",bgDown:"/buttons/esc/human/human-options-menu-background.blp",bgDisabled:n,border:e,borderDown:r,borderDisabled:e,hover:"/buttons/esc/human/human-options-button-highlight.blp"}:t==="Orc"?{bg:"/buttons/esc/orc/orc-options-button-background.blp",bgDown:"/buttons/esc/orc/orc-options-button-background-down.blp",bgDisabled:n,border:e,borderDown:r,borderDisabled:e,hover:"/buttons/esc/orc/orc-options-button-highlight.blp"}:t==="NightElf"?{bg:"/buttons/esc/nightelf/nightelf-options-button-background.blp",bgDown:"/buttons/esc/nightelf/nightelf-options-button-background-down.blp",bgDisabled:n,border:e,borderDown:r,borderDisabled:e,hover:"/buttons/esc/nightelf/nightelf-options-button-highlight.blp"}:{bg:"/buttons/esc/undead/undead-options-button-background.blp",bgDown:"/buttons/esc/undead/undead-options-button-background-down.blp",bgDisabled:"/buttons/esc/undead/undead-options-button-background-disabled.blp",border:e,borderDown:r,borderDisabled:e,hover:"/buttons/esc/undead/undead-options-button-highlight.blp"}}function sb(t){return t==="Orc"?"/buttons/checkbox/orc-checkbox-depressed.blp":t==="NightElf"?"/buttons/checkbox/nightelf-checkbox-depressed.blp":t==="Undead"?"/buttons/checkbox/undead-checkbox-depressed.blp":"/buttons/checkbox/checkbox-depressed.blp"}function ab(t){return t==="Orc"?"/buttons/slider/orc-slider-knob.blp":t==="NightElf"?"/buttons/slider/nightelf-slider-knob.blp":t==="Undead"?"/buttons/slider/undead-slider-knob.blp":"/buttons/slider/slider-knob.blp"}function qa(t){return t==="Orc"?"/buttons/esc/orc/orc-options-menu-border.blp":t==="NightElf"?"/buttons/esc/nightelf/nightelf-options-menu-border.blp":t==="Undead"?"/buttons/esc/undead/undead-options-menu-border.blp":"/buttons/esc/human/human-options-menu-border.blp"}function lb(t){return t==="Human"?"/buttons/command/BTNPeasant.blp":t==="NightElf"?"/buttons/command/BTNWisp.blp":t==="Undead"?"/buttons/command/BTNAcolyte.blp":"/buttons/command/BTNPeon.blp"}async function F(t){const e=Oa.get(t);if(e)return e;const r=(async()=>{const n=await fetch(t);if(!n.ok)throw new Error(`Failed to fetch icon ${t}`);const i=await n.arrayBuffer(),o=rn(i),s=nn(o,0),a=new Uint8ClampedArray(s.data);if(rb(t)){let l=!0;for(let d=3;d<a.length;d+=4)if(a[d]!==0){l=!1;break}if(l)for(let d=3;d<a.length;d+=4)a[d]=255}if(nb(t))for(let l=0;l<a.length;l+=4){const d=a[l],g=a[l+1],f=a[l+2];a[l+3]>224&&d<=10&&g<=10&&f<=10&&(a[l+3]=0)}const c=document.createElement("canvas");c.width=s.width,c.height=s.height;const u=c.getContext("2d");if(!u)throw new Error(`Failed to decode icon ${t}`);return u.putImageData(new ImageData(a,s.width,s.height),0,0),c.toDataURL("image/png")})();return Oa.set(t,r),r}async function q(t){const e=Ha.get(t);if(e)return e;const r=new Promise((n,i)=>{const o=new Image;o.onload=()=>n(o),o.onerror=()=>i(new Error(`Failed to load image ${t}`)),o.src=t});return Ha.set(t,r),r}async function cb(t,e=1,r=0){const n=`${t}|${e}|${r}`,i=Xa.get(n);if(i)return i;const o=(async()=>{const s=await q(t),a=Math.max(1,Math.floor(e)),c=Math.max(1,Math.floor(s.height/a)),l=Math.max(0,Math.min(a-1,Math.floor(r)))*c,d=document.createElement("canvas");d.width=s.width,d.height=c;const g=d.getContext("2d");return g?(g.clearRect(0,0,d.width,d.height),g.drawImage(s,0,l,s.width,c,0,0,s.width,c),{url:d.toDataURL("image/png"),width:d.width,height:d.height}):{url:t,width:s.width,height:c}})();return Xa.set(n,o),o}async function ub(t,e,r,n,i){const o=`${t}|${e}|${r}|${n}|${i}`,s=Wa.get(o);if(s)return s;const a=(async()=>{const c=await q(t),u=Math.max(0,Math.min(c.width-1,Math.floor(e))),l=Math.max(0,Math.min(c.height-1,Math.floor(r))),d=Math.max(1,Math.min(c.width-u,Math.floor(n))),g=Math.max(1,Math.min(c.height-l,Math.floor(i))),f=document.createElement("canvas");f.width=d,f.height=g;const h=f.getContext("2d");return h?(h.clearRect(0,0,d,g),h.drawImage(c,u,l,d,g,0,0,d,g),f.toDataURL("image/png")):t})();return Wa.set(o,a),a}async function db(t){const e=za.get(t);if(e)return e;const r=(async()=>{const n=await F(`/cursor/${t}Cursor.blp`),i=await q(n),o=8,s=4,a=Math.max(1,Math.floor(i.width/o)),c=Math.max(1,Math.floor(i.height/s)),u=document.createElement("canvas");u.width=a,u.height=c;const l=u.getContext("2d");return l?(l.imageSmoothingEnabled=!1,l.clearRect(0,0,a,c),l.drawImage(i,0,0,a,c,0,0,a,c),u.toDataURL("image/png")):n})();return za.set(t,r),r}function Vr(t,e,r,n){const i=document.createElement("canvas");i.width=n,i.height=r;const o=i.getContext("2d");return o&&(o.translate(n,0),o.rotate(Math.PI/2),o.drawImage(t,e*r,0,r,n,0,0,r,n)),i}function We(t,e,r,n,i){const o=Math.max(1,t.clientWidth||1),s=Math.max(1,t.clientHeight||1),a=window.devicePixelRatio||1,c=Math.max(1,Math.round(o*a)),u=Math.max(1,Math.round(s*a));(t.width!==c||t.height!==u)&&(t.width=c,t.height=u);const l=t.getContext("2d");if(!l)return;l.setTransform(a,0,0,a,0,0),l.clearRect(0,0,o,s);const d=r.width,g=r.height,f=d/8,h=Math.max(1,Math.floor(Math.min(f,s*.35,o/2,s/2))),v=Math.max(1,Math.round(h*.25));l.fillStyle="#000",l.fillRect(v,v,o-v*2,s-v*2);const S=l.createPattern(e,"repeat");S&&(l.fillStyle=S,l.fillRect(v,v,o-v*2,s-v*2));const p=(U,x,b,y,T)=>{l.drawImage(r,U*f,0,f,g,x,b,y,T)};p(4,0,0,h,h),p(5,o-h,0,h,h),p(6,0,s-h,h,h),p(7,o-h,s-h,h,h);const w=s-h*2;w>0&&(p(0,0,h,h,w),p(1,o-h,h,h,w));const m=o-h*2;if(m>0){const U=Vr(r,2,f,g),x=Vr(r,3,f,g);l.drawImage(U,h,0,m,h),l.drawImage(x,h,s-h,m,h)}if(i&&n){const U=document.createElement("canvas");U.width=c,U.height=u;const x=U.getContext("2d");x&&(x.setTransform(a,0,0,a,0,0),x.drawImage(t,0,0,o,s),x.globalCompositeOperation="source-in",x.drawImage(n,0,0,o,s),l.save(),l.globalCompositeOperation="lighter",l.drawImage(U,0,0,o,s),l.restore())}}function Ya(t,e,r,n,i,o){if(i<=0||o<=0)return;let s=0;for(;s<i;){const a=Math.min(o,i-s),c=a/o*e.width;t.drawImage(e,0,0,c,e.height,r+s,n,a,o),s+=a}}function Rt(t,e,r,n){const i=Math.max(1,t.clientWidth||1),o=Math.max(1,t.clientHeight||1),s=window.devicePixelRatio||1,a=Math.max(1,Math.round(i*s)),c=Math.max(1,Math.round(o*s));(t.width!==a||t.height!==c)&&(t.width=a,t.height=c);const u=t.getContext("2d");if(!u)return;u.setTransform(s,0,0,s,0,0),u.clearRect(0,0,i,o);const l=r.width,d=r.height,g=l/8,f=Math.max(1,Math.floor(Math.min(g,d))),h=Math.max(1,Math.floor(Math.min(n.cornerPx,f,i/2,o/2))),v=Math.max(0,Math.floor(Math.min(n.insetPx,i/2,o/2))),S=v,p=v,w=Math.max(0,i-v*2),m=Math.max(0,o-v*2),U=n.fillCornerMaxPx??8,x=Math.max(0,Math.floor(Math.min(h,U,w/2,m/2)));if(w>0&&m>0){if(u.save(),u.beginPath(),x>0?u.roundRect(S,p,w,m,x):u.rect(S,p,w,m),u.clip(),n.opaqueBaseFill&&(u.fillStyle=n.opaqueBaseFill,u.fillRect(S,p,w,m)),n.tileBackground===!1)u.drawImage(e,0,0,e.width,e.height,S,p,w,m);else{const P=u.createPattern(e,"repeat");P&&(u.fillStyle=P,u.fillRect(S,p,w,m))}u.restore()}const b=(P,k,L,N,D)=>{u.drawImage(r,P*g,0,g,d,k,L,N,D)};b(4,0,0,h,h),b(5,i-h,0,h,h),b(6,0,o-h,h,h),b(7,i-h,o-h,h,h);const y=o-h*2;y>0&&(b(0,0,h,h,y),b(1,i-h,h,h,y));const T=i-h*2;if(T>0){const P=Vr(r,2,g,d),k=Vr(r,3,g,d);n.tileHorizontalEdges?(Ya(u,P,h,0,T,h),Ya(u,k,h,o-h,T,h)):(u.drawImage(P,h,0,T,h),u.drawImage(k,h,o-h,T,h))}}function Ka(t){const e=t.width/8,r=t.height,n=Math.max(1,Math.floor(Math.min(e,r))),i=document.createElement("canvas");i.width=n*3,i.height=n*3;const o=i.getContext("2d");if(!o)return"";o.clearRect(0,0,i.width,i.height),o.imageSmoothingEnabled=!1;const s=(u,l,d)=>{o.drawImage(t,u*e,0,e,r,l,d,n,n)};s(4,0,0),s(5,n*2,0),s(6,0,n*2),s(7,n*2,n*2),s(0,0,n),s(1,n*2,n);const a=Vr(t,2,e,r),c=Vr(t,3,e,r);return o.drawImage(a,n,0,n,n),o.drawImage(c,n,n*2,n,n),i.toDataURL("image/png")}function fb(t,e){const r=Math.max(0,Math.min(100,t)),n=e.minScaleX+(e.maxScaleX-e.minScaleX)*r/100;return Math.max(0,Math.min(1,e.fillToFrameWidth*n))}const Yr=document.createElement("canvas");function hb(t,e,r,n,i,o,s){(Yr.width!==e||Yr.height!==r)&&(Yr.width=e,Yr.height=r);const a=Yr.getContext("2d");if(!a)return;a.setTransform(n,0,0,n,0,0),a.clearRect(0,0,i,o),a.imageSmoothingEnabled=!0,s(a);const c=a.getImageData(0,0,e,r),u=t.getImageData(0,0,e,r),l=c.data,d=u.data;for(let g=0;g<d.length;g+=4){const f=l[g]/255,h=l[g+1]/255,v=l[g+2]/255,S=l[g+3]/255;d[g]=Math.min(255,d[g]+Math.round(f*f*255)),d[g+1]=Math.min(255,d[g+1]+Math.round(h*h*255)),d[g+2]=Math.min(255,d[g+2]+Math.round(v*v*255)),d[g+3]=Math.min(255,d[g+3]+Math.round(S*S*255))}t.putImageData(u,0,0)}function Kr(t,e,r,n,i,o,s){const a=t.getBoundingClientRect(),c=Math.max(1,a.width),u=Math.max(1,a.height),l=window.devicePixelRatio||1,d=Math.max(1,Math.round(c*l)),g=Math.max(1,Math.round(u*l));(t.width!==d||t.height!==g)&&(t.width=d,t.height=g);const f=t.getContext("2d");if(!f)return;f.setTransform(l,0,0,l,0,0),f.clearRect(0,0,c,u),f.imageSmoothingEnabled=!0;const h=c*fb(i,o);h>0&&(f.drawImage(e,0,0,e.width,e.height,0,0,h,u),s&&(f.save(),f.globalCompositeOperation="multiply",f.fillStyle=s,f.fillRect(0,0,h,u),f.restore())),n&&hb(f,d,g,l,c,u,v=>{v.drawImage(n,0,0,n.width,n.height,0,0,c,u)}),f.drawImage(r,0,0,r.width,r.height,0,0,c,u)}function Qa(t,e,r){const n=Math.max(0,Math.min(1,r));return[Math.round(t[0]+(e[0]-t[0])*n),Math.round(t[1]+(e[1]-t[1])*n),Math.round(t[2]+(e[2]-t[2])*n)]}function Za([t,e,r]){return`#${[t,e,r].map(n=>n.toString(16).padStart(2,"0")).join("")}`}function gb(t){const e=Math.max(0,Math.min(100,t)),r=[220,42,22],n=[238,201,46],i=[67,213,61];return e<=35?Za(Qa(r,n,e/35)):Za(Qa(n,i,(e-35)/65))}function ja(t){return 1-(1-Math.max(0,Math.min(1,t)))**3}function Bl(t,e){if(e.length===0)return 0;if(t<=e[0][0])return e[0][1];for(let r=1;r<e.length;r++){const[n,i]=e[r],[o,s]=e[r-1];if(t<=n){const a=(t-o)/Math.max(1e-4,n-o);return s+(i-s)*a}}return e[e.length-1][1]}function mb(t){return Bl(t,[[0,82],[130,82.8],[230,82.35],[340,83.95],[430,83.3],[560,85.2],[650,84.45],[780,87.25],[870,86.55],[940,88.9],[1e3,90]])}function pb(t){const e=Sr,r=(t%e+e)%e,n=e-_r-Ni;if(r<_r){const o=r/_r;return ja(o)*_v}if(r<_r+Ni)return mb(r-_r);const i=(r-_r-Ni)/Math.max(1,n);return Ba+ja(i)*(100-Ba)}function vb(t){const e=Math.max(0,Math.min(100,t));return Bl(e,[[0,0],[42.6135,0],[99.4332,1],[100,0]])}function bb(t){let e;const[r,n]=C(!1),[i,o]=C(!1),[s,a]=C(""),c=()=>{const l=t.variant.buttonText,d=t.variant.buttonHotkey;return d&&l.toLowerCase().startsWith(d.toLowerCase())?l.slice(d.length):l},u=()=>{const l=t.variant.buttonPlacement,d=l.anchor==="top-left"?l.offsetX/l.backdropW*100:100-(l.offsetX+l.buttonW)/l.backdropW*100,g=100-d-l.buttonW/l.backdropW*100,f=l.offsetY/l.backdropH*100,h=100-f-l.buttonH/l.backdropH*100;return{left:`${d}%`,right:`${g}%`,top:`${f}%`,bottom:`${h}%`}};return de(()=>{const l=t.variant.src;if(!l){a("");return}let d=!1;cb(l,t.variant.atlasRows??1,t.variant.atlasRow??0).then(g=>{d||a(g.url)}).catch(g=>console.error(g)),ce(()=>{d=!0})}),de(()=>{const l=e,d=i()?t.glueBgDownUrl():t.glueBgUrl(),g=i()?t.glueBorderDownUrl():t.glueBorderUrl(),f=r()&&!i(),h=t.glueHoverUrl();if(!l||!d||!g)return;let v=!1;Promise.all([q(d),q(g),h?q(h):Promise.resolve(null)]).then(([S,p,w])=>{v||We(l,S,p,w,f)}).catch(S=>console.error(S)),ce(()=>{v=!0})}),(()=>{var l=Up(),d=l.firstChild,g=d.firstChild,f=g.firstChild,h=f.nextSibling,v=d.nextSibling;_(d,(()=>{var p=ft(()=>!!s());return()=>p()&&(()=>{var w=Cp();return me(()=>le(w,"src",s())),w})()})(),g),g.$$mouseup=()=>o(!1),g.$$mousedown=()=>o(!0),g.addEventListener("mouseleave",()=>{n(!1),o(!1)}),g.addEventListener("mouseenter",()=>n(!0));var S=e;return typeof S=="function"?we(S,f):e=f,_(h,(()=>{var p=ft(()=>!!t.variant.buttonHotkey);return()=>p()&&(()=>{var w=Bp();return _(w,()=>t.variant.buttonHotkey),w})()})(),null),_(h,c,null),_(v,()=>t.variant.label),me(p=>{var w=`${t.variant.widthPx}px`,m=`${t.variant.heightPx}px`,U=t.variant.innerTemplate==="tiny",x=u(),b=i()?`translate(${Dr}px, ${Lr}px)`:"none";return w!==p.e&&ie(d,"width",p.e=w),m!==p.t&&ie(d,"height",p.t=m),U!==p.a&&g.classList.toggle("menu-frame-variant-inner--tiny",p.a=U),p.o=Ji(g,x,p.o),b!==p.i&&ie(h,"transform",p.i=b),p},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),l})()}function xb(){let t,e,r,n,i,o,s,a,c,u,l,d,g,f,h,v,S,p,w,m,U,x,b,y,T,P,k,L,N,D,V,$,I,pe,K;const[Te,Ie]=C(""),[Le,Oe]=C(""),[Fe,ze]=C(""),[Xe,ct]=C(""),[Ze,ht]=C(""),[qe,je]=C(""),[$e,Ge]=C(""),[St,ut]=C(""),[gt,Ct]=C(""),[Gt,Ve]=C(""),[wr,dr]=C(""),[ve,Ee]=C(""),[_e,it]=C(""),[ye,ke]=C(""),[Je,tt]=C(""),[ot,kr]=C(""),[Wt,Wn]=C(""),[Pr,Al]=C(""),[qn,Ml]=C(""),[lo,_l]=C(""),[co,Dl]=C(""),[Ll,Rl]=C(""),[Fl,$l]=C(""),[Vl,kl]=C(""),[Il,Gl]=C(""),[Nl,Ol]=C(""),[Hl,zl]=C(""),[Xl,Wl]=C(""),[uo,ql]=C(""),[Yn,Yl]=C(""),[fo,Kl]=C(""),[Ql,Zl]=C(""),[ho,jl]=C(""),[Jl,ec]=C(""),[Sb,tc]=C(""),[wb,rc]=C(""),[go,nc]=C(""),[mo,ic]=C(""),[po,oc]=C(""),[Pb,sc]=C(""),[vo,ac]=C(""),[bo,lc]=C(""),[Ir,cc]=C(""),[xo,uc]=C(""),[dc,fc]=C(""),[hc,gc]=C(""),[mc,pc]=C(""),[vc,bc]=C(""),[xc,Sc]=C(""),[wc,Pc]=C(""),[Tc,yc]=C(""),[Uc,So]=C(""),[Cc,Bc]=C(""),[Ec,Ac]=C(""),[Mc,_c]=C(""),[wo,Dc]=C(""),[Po,Lc]=C(""),[Rc,Fc]=C(""),[To,$c]=C(""),[yo,Vc]=C(""),[kc,Ic]=C(""),[Uo,Gc]=C(""),[on,Nc]=C(""),[sn,Oc]=C(""),[Hc,zc]=C({}),[Co,Xc]=C(""),[Bo,Wc]=C(""),[qc,Yc]=C(""),[Kc,Qc]=C(""),[Eo,Zc]=C(""),[Ao,jc]=C(""),[Kn,Jc]=C(""),[Qn,eu]=C(""),[Zn,tu]=C(""),[jn,ru]=C(""),[Jn,nu]=C(""),[iu,ou]=C(""),[Mo,su]=C(0),[_o,au]=C(0),[ei,lu]=C(0),[ti,cu]=C(10),[uu,du]=C(Number.POSITIVE_INFINITY),[fu,Do]=C(null),[hu,ri]=C(null),[gu,Lo]=C(!1),[an,ni]=C(!1),[mu,Ro]=C(!1),[ln,ii]=C(!1),[pu,Fo]=C(!1),[cn,oi]=C(!1),[$o,Vo]=C(!1),[un,si]=C(!1),[vu,ko]=C(!1),[dn,ai]=C(!1),[bu,Io]=C(!1),[fn,li]=C(!1),[Tr,xu]=C(""),[Go,Su]=C(""),[ci,wu]=C(""),[Pu,Tu]=C(Na),[yu,Uu]=C(Na),[Cu,Bu]=C(""),[Eu,Au]=C(""),[Mu,_u]=C(""),[Tb,Du]=C(""),[yb,Lu]=C(""),[Ru,Fu]=C(""),[$u,No]=C(!1),[Oo,ui]=C(!1),[di,Vu]=C(""),[ku,Iu]=C(""),[fi,Gu]=C(""),[Ho,Nu]=C(""),[hi,Ou]=C(""),[zo,Hu]=C(""),[Xo,zu]=C(""),[Xu,Wu]=C(""),[Wo,qu]=C(!1),[Yu,gi]=C(!1),[qo,Ku]=C(0),[Qu,Yo]=C(!1),[hn,mi]=C(!1),[Zu,Ko]=C(!1),[gn,pi]=C(!1),[ju,Qo]=C(!1),[mn,vi]=C(!1),[Ju,Zo]=C(!1),[yr,jo]=C(!1),[Jo,ed]=C("High"),[bi,td]=C(55),[rd,nd]=C("PlayerOne"),[id,od]=C("Azeroth-1"),[xi,sd]=C(18),[es,ts]=C(38),[ad,ld]=C("Normal"),[Si,rs]=C(12),[ns,cd]=C(0),[is,ud]=C(0),pn=()=>{const B=ei();return B>80?{text:"High Upkeep",color:"#c84848"}:B>50?{text:"Low Upkeep",color:"#d6b34a"}:{text:"No Upkeep",color:"#58d869"}},Bt=()=>uu()<=fv,os=()=>Bt()?dv:`${so}vw`,dd=()=>`calc(${os()} + 12px)`,ss=()=>La[ns()%La.length],as=()=>Ra[ns()%Ra.length],wi=B=>(is()+B)%Sr/Sr*100,ls=()=>wi(Cv),cs=()=>wi(Bv),us=()=>wi(Ev),Pi=()=>pb(is()+Mv),ds=()=>Math.max(Av,Pi()),fd=()=>vb(Pi()),hd=()=>ds()/100*Dv,gd=()=>qr(bi(),Ea,Aa),md=()=>qr(65,Ea,Aa),pd=()=>qr(es(),Ma,_a),vd=()=>qr(58,Ma,_a),bd=()=>ib(xi(),Lv,Rv,Fv),xd=()=>qr(Si(),$v,Vv),Sd=ka.length*Oi+Gv+Nv,Ti=Math.max(0,Sd-Kv),wd=()=>{if(Ti<=0)return 0;const B=xi()/100*Ti,A=Math.round(B/Oi)*Oi;return Math.max(0,Math.min(Ti,A))},Pd=Math.max(1,Math.floor((Qv-Xv-Wv)/Fa)),fs=Math.max(0,Va.length-Pd),Td=()=>fs<=0?0:Math.round(Si()/100*fs)*Fa,hs=B=>{ts(A=>Math.max(0,Math.min(100,A+B)))},gs=B=>{rs(A=>Math.max(0,Math.min(100,A+B)))},yd=()=>[{label:"Border",source:"StandardMenuButtonBaseBackdrop",fdfSize:"0.256 x 0.064",widthPx:256,heightPx:64,atlasRows:1,atlasRow:0,src:qe(),innerTemplate:"standard",buttonPlacement:{backdropW:.256,backdropH:.064,buttonW:.179,buttonH:.031,anchor:"top-right",offsetX:.012,offsetY:.0165},buttonText:"Single Player",buttonHotkey:"S"},{label:"BorderSingle",source:"StandardMenuSingleButtonBaseBackdrop",fdfSize:"0.256 x 0.064",widthPx:256,heightPx:64,atlasRows:1,atlasRow:0,src:$e(),innerTemplate:"standard",buttonPlacement:{backdropW:.256,backdropH:.064,buttonW:.159,buttonH:.031,anchor:"top-right",offsetX:.032,offsetY:.015625},buttonText:"OK",buttonHotkey:"O"},{label:"Large",source:"StandardMenuLargeButtonBaseBackdrop",fdfSize:"0.256 x 0.064",widthPx:256,heightPx:64,atlasRows:1,atlasRow:0,src:Gt(),innerTemplate:"standard",buttonPlacement:{backdropW:.256,backdropH:.064,buttonW:.2085,buttonH:.031,anchor:"top-right",offsetX:.012,offsetY:.0165},buttonText:"Campaign",buttonHotkey:"C"},{label:"LargeSingle",source:"StandardMenuSingleLargeButtonBaseBackdrop",fdfSize:"0.256 x 0.064",widthPx:256,heightPx:64,atlasRows:1,atlasRow:0,src:wr(),innerTemplate:"standard",buttonPlacement:{backdropW:.256,backdropH:.064,buttonW:.187,buttonH:.031,anchor:"top-right",offsetX:.032,offsetY:.015625},buttonText:"Accept",buttonHotkey:"A"},{label:"Small",source:"StandardMenuSmallButtonBaseBackdrop",fdfSize:"0.256 x 0.064",widthPx:256,heightPx:64,atlasRows:1,atlasRow:0,src:ve(),innerTemplate:"standard",buttonPlacement:{backdropW:.256,backdropH:.064,buttonW:.128,buttonH:.031,anchor:"top-right",offsetX:.012,offsetY:.0165},buttonText:"Replay",buttonHotkey:"R"},{label:"SmallSingle",source:"StandardMenuSingleSmallButtonBaseBackdrop",fdfSize:"0.256 x 0.064",widthPx:256,heightPx:64,atlasRows:1,atlasRow:0,src:_e(),innerTemplate:"standard",buttonPlacement:{backdropW:.256,backdropH:.064,buttonW:.1035,buttonH:.031,anchor:"top-right",offsetX:.035,offsetY:.015625},buttonText:"Back",buttonHotkey:"B"},{label:"Tiny",source:"StandardMenuTinyButtonBaseBackdrop",fdfSize:"0.11 x 0.055",widthPx:110,heightPx:55,atlasRows:1,atlasRow:0,src:ye(),innerTemplate:"tiny",buttonPlacement:{backdropW:.11,backdropH:.055,buttonW:.03,buttonH:.026,anchor:"top-right",offsetX:.009,offsetY:.014},buttonText:"G",buttonHotkey:""},{label:"Multiplayer",source:"Unreferenced FDF (2-row atlas)",fdfSize:"top row shown",widthPx:256,heightPx:64,atlasRows:2,atlasRow:0,src:Je(),innerTemplate:"standard",buttonPlacement:{backdropW:.256,backdropH:.064,buttonW:.179,buttonH:.031,anchor:"top-right",offsetX:.012,offsetY:.0165},buttonText:"Battle.net",buttonHotkey:"B"}];return de(()=>{const B=Pt();let A=!1;db(B).then(M=>{A||document.documentElement.style.setProperty("--wc3-game-cursor",`url("${M}") 2 2, auto`)}).catch(M=>{console.error(M),document.documentElement.style.setProperty("--wc3-game-cursor","auto")}),ce(()=>{A=!0})}),ce(()=>{document.documentElement.style.setProperty("--wc3-game-cursor","auto")}),de(()=>{const B=Pt(),A=Ut[B].tile;let M=!1;const R=ob(B);Promise.all([F(`/console-buttons/${Ut[B].lower}-console-buttonstates2.blp`),F("/buttons/glue/GlueScreen-Button1-BackdropBackground.blp"),F("/buttons/glue/GlueScreen-Button1-BackdropBackground-Down.blp"),F("/buttons/glue/GlueScreen-Button1-BackdropBorder.blp"),F("/buttons/glue/GlueScreen-Button1-BackdropBorder-Down.blp"),F("/buttons/glue/GlueScreen-Button1-Border.blp"),F("/borders/glue/GlueScreen-Button1-BorderSingle.blp"),F(qa(B)),F("/borders/glue/GlueScreen-Button1-LargeBorder.blp"),F("/borders/glue/GlueScreen-Button1-LargeBorderSingle.blp"),F("/borders/glue/GlueScreen-Button1-SmallBorder.blp"),F("/borders/glue/GlueScreen-Button1-SmallBorderSingle.blp"),F("/borders/glue/GlueScreen-Button1-TinyBorder.blp"),F("/borders/glue/GlueScreen-Button1-MultiplayerBorder.blp"),F("/buttons/glue/bnet-button01-highlight-mouse.blp"),F("/buttons/glue/GlueScreen-Button1-BackdropBackground-Disabled.blp"),F("/buttons/glue/GlueScreen-Button1-BackdropBorder-Disabled.blp"),F(R.bg),F(R.bgDown),F(R.bgDisabled),F(R.border),F(R.borderDown),F(R.borderDisabled),F(R.hover),F("/borders/esc/editbox-background.blp"),F("/borders/esc/editbox-border.blp"),F("/resources/ResourceGold.blp"),F("/resources/ResourceLumber.blp"),F(`/resources/Resource${A}.blp`),F("/resources/ResourceSupply.blp"),F("/buttons/command/BTNHolyBolt.blp"),F("/buttons/command/DISBTNHolyBolt.blp"),F("/buttons/command/human-activebutton.blp"),F("/buttons/checkbox/checkbox-background.blp"),F(sb(B)),F("/buttons/checkbox/checkbox-check.blp"),F("/buttons/checkbox/checkbox-background-disabled.blp"),F("/buttons/radio/radiobutton-background.blp"),F("/buttons/radio/radiobutton-background-disabled.blp"),F("/buttons/radio/radiobutton-button.blp"),F("/buttons/radio/radiobutton-buttondisabled.blp")]).then(([E,H,z,Ce,he,wt,Et,At,qt,Yt,Kt,Qt,Zt,jt,Jt,er,tr,Gr,J,W,X,G,O,j,ae,oe,ne,ee,Q,re,xe,Se,ge,Z,Pe,fe,se,te,Ue,Ae,be])=>{M||(Ie(E),Oe(H),ze(z),ct(Ce),ht(he),je(wt),Ge(Et),ut(At),Ve(qt),dr(Yt),Ee(Kt),it(Qt),ke(Zt),tt(jt),kr(Jt),Wn(er),Al(tr),Dc(Gr),Lc(J),Fc(W),$c(X),Vc(G),Ic(O),Gc(j),Nc(ae),Oc(oe),Xc(ne),Wc(ee),Yc(Q),Qc(re),xu(xe),Su(Se),wu(ge),Vu(Z),Iu(Pe),Gu(fe),Nu(se),Ou(te),Hu(Ue),zu(Ae),Wu(be))}).catch(E=>console.error(E)),ce(()=>{M=!0})}),de(()=>{const B=St();if(!B){Ct("");return}let A=!1;q(B).then(M=>{A||Ct(Ka(M))}).catch(M=>console.error(M)),ce(()=>{A=!0})}),de(()=>{const B=Tc();if(!B){So("");return}let A=!1;q(B).then(M=>{A||So(Ka(M))}).catch(M=>console.error(M)),ce(()=>{A=!0})}),de(()=>{const B=Pt();let A=!1;Promise.all([F("/buttons/glue/GlueScreen-Button1-BorderedBackdropBorder.blp"),F("/buttons/glue/GlueScreen-Button1-BorderedBackdropBorder-Down.blp"),F("/buttons/glue/GlueScreen-Button1-BorderedBackdropBorder-Disabled.blp"),F("/buttons/campaign/GlueScreen-CampaignButton-BackdropBackground.blp"),F("/buttons/campaign/GlueScreen-CampaignButton-BackdropBackground-Down.blp"),F("/buttons/campaign/GlueScreen-CampaignButton-BackdropBackground-Disabled.blp"),F("/buttons/campaign/GlueScreen-CampaignButton-BackdropBorder.blp"),F("/buttons/campaign/GlueScreen-CampaignButton-BackdropBorder-Down.blp"),F("/buttons/campaign/GlueScreen-CampaignButton-BackdropBorder-Disabled.blp"),F("/buttons/popup/GlueScreen-Pulldown-BackdropBackground.blp"),F("/buttons/popup/GlueScreen-Pulldown-Arrow.blp"),F("/buttons/slider/slider-background.blp"),F("/buttons/slider/slider-border.blp"),F("/buttons/slider/slider-borderdisabled.blp"),F(ab(B)),F("/buttons/slider/slider-knobdisabled.blp"),F("/bars/human-healthbar-fill.blp"),F("/bars/human-manabar-fill.blp"),F("/bars/human-bigbar-fill.blp"),F("/bars/human-buildprogressbar-fill.blp"),F("/bars/human-statbar-color2.blp"),F("/bars/human-statbar-color.blp"),F("/bars/human-statbar-edge.blp"),F("/bars/human-statbar-highlight.blp"),F("/bars/human-xpbar-border.blp"),F("/bars/human-buildprogressbar-border.blp"),F("/loading/Loading-BarBackground.blp"),F("/loading/Loading-BarFill.blp"),F("/loading/Loading-BarBorder.blp"),F("/loading/Loading-BarGlass.blp"),F("/loading/Loading-BarGlow.blp"),F("/tooltips/human-tooltip-background.blp"),F("/tooltips/human-tooltip-border.blp"),F("/tooltips/ToolTipGoldIcon.blp"),F("/tooltips/ToolTipLumberIcon.blp"),F("/tooltips/ToolTipSupplyIcon.blp"),F("/buttons/command/human-multipleselection-border.blp"),F("/borders/console/human-unitqueue-border.blp").then(M=>ub(M,7,18,241,93)),F(lb(B)),F("/buttons/command/human-multipleselection-heroglow.blp"),F("/buttons/command/human-button-lvls-overlay.blp"),F("/buttons/command/human-subgroup-background.blp"),F("/buttons/editbox/bnet-inputbox-back.blp"),F("/buttons/editbox/bnet-inputbox-border.blp"),F("/buttons/scrollbar/GlueScreen-Scrollbar-BackdropBackground.blp"),F("/buttons/scrollbar/GlueScreen-Scrollbar-BackdropBorder.blp"),F("/buttons/scrollbar/GlueScreen-Scrollbar-UpArrow.blp"),F("/buttons/scrollbar/GlueScreen-Scrollbar-DownArrow.blp"),F("/buttons/scrollbar/SinglePlayerSkirmish-ScrollBarKnob.blp"),F("/buttons/scrollbar/SinglePlayerSkirmish-ScrollBarKnobDisabled.blp")]).then(([M,R,E,H,z,Ce,he,wt,Et,At,qt,Yt,Kt,Qt,Zt,jt,Jt,er,tr,Gr,J,W,X,G,O,j,ae,oe,ne,ee,Q,re,xe,Se,ge,Z,Pe,fe,se,te,Ue,Ae,be,Be,rt,Mt,_t,Dt,fr,hr])=>{A||(Ml(M),_l(R),Dl(E),Rl(H),$l(z),kl(Ce),Gl(he),Ol(wt),zl(Et),Wl(At),ql(qt),Yl(Yt),Kl(Kt),Zl(Qt),jl(Zt),ec(jt),tc(Jt),rc(er),ic(tr),oc(Gr),sc(J),nc(W),ac(X),lc(O),cc(G),uc(j),fc(ae),gc(oe),pc(ne),bc(ee),Sc(Q),Pc(re),yc(xe),Bc(Se),Ac(ge),_c(Z),Bu(Pe),Au(fe),_u(se),Du(te),Lu(Ue),Fu(Ae),Zc(be),jc(Be),Jc(rt),eu(Mt),tu(_t),ru(Dt),nu(fr),ou(hr))}).catch(M=>console.error(M)),ce(()=>{A=!0})}),de(()=>{let B=!1;Promise.all([F("/buttons/command/BTNWindWalkOn.blp"),F("/buttons/command/BTNMirrorImage.blp"),F("/buttons/command/BTNCriticalStrike.blp"),F("/buttons/command/BTNWhirlwind.blp"),F("/buttons/command/BTNSkillz.blp"),F("/buttons/command/BTNAttack.blp"),F("/buttons/command/BTNMove.blp"),F("/buttons/command/BTNStop.blp"),F("/buttons/command/BTNHoldPosition.blp"),F("/buttons/command/BTNPatrol.blp"),F("/buttons/command/DISBTNWindWalkOn.blp"),F("/buttons/command/DISBTNMirrorImage.blp"),F("/buttons/command/DISBTNCriticalStrike.blp"),F("/buttons/command/DISBTNWhirlwind.blp"),F("/buttons/command/DISBTNSkillz.blp"),F("/buttons/command/DISBTNAttack.blp"),F("/buttons/command/DISBTNMove.blp"),F("/buttons/command/DISBTNStop.blp"),F("/buttons/command/DISBTNHoldPosition.blp"),F("/buttons/command/DISBTNPatrol.blp")]).then(([A,M,R,E,H,z,Ce,he,wt,Et,At,qt,Yt,Kt,Qt,Zt,jt,Jt,er,tr])=>{B||(Tu({windWalk:A,mirrorImage:M,criticalStrike:R,bladestorm:E,skillz:H,attack:z,move:Ce,stop:he,holdPosition:wt,patrol:Et}),Uu({windWalk:At,mirrorImage:qt,criticalStrike:Yt,bladestorm:Kt,skillz:Qt,attack:Zt,move:jt,stop:Jt,holdPosition:er,patrol:tr}))}).catch(A=>console.error(A)),ce(()=>{B=!0})}),de(()=>{const B=t,A=an()?Fe():Le(),M=an()?Ze():Xe(),R=gu()&&!an(),E=ot();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),E?q(E):Promise.resolve(null)]).then(([z,Ce,he])=>{H||We(B,z,Ce,he,R)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=r,A=hn()?Fe():Le(),M=hn()?lo():qn(),R=Qu()&&!hn(),E=ot();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),E?q(E):Promise.resolve(null)]).then(([z,Ce,he])=>{H||We(B,z,Ce,he,R)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=n,A=Wt(),M=co();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=i,A=gn()?Fe():Le(),M=gn()?Ze():Xe(),R=Zu()&&!gn(),E=ot();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),E?q(E):Promise.resolve(null)]).then(([z,Ce,he])=>{H||We(B,z,Ce,he,R)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=o,A=Wt(),M=Pr();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=s,A=mn()?Fl():Ll(),M=mn()?Nl():Il(),R=ju()&&!mn(),E=ot();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),E?q(E):Promise.resolve(null)]).then(([z,Ce,he])=>{H||We(B,z,Ce,he,R)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=a,A=Vl(),M=Hl();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=c,A=yr()?Fe():Le(),M=yr()?lo():qn(),R=Ju()&&!yr(),E=ot();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),E?q(E):Promise.resolve(null)]).then(([z,Ce,he])=>{H||We(B,z,Ce,he,R)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=u,A=Wt(),M=co();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=yr(),A=l,M=Xl()||Le(),R=qn();if(!B||!A||!M||!R)return;let E=!1;Promise.all([q(M),q(R)]).then(([H,z])=>{E||We(A,H,z,null,!1)}).catch(H=>console.error(H)),ce(()=>{E=!0})}),de(()=>{const B=d,A=go(),M=vo(),R=Ir(),E=ss();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),R?q(R):Promise.resolve(null)]).then(([z,Ce,he])=>{H||Kr(B,z,Ce,he,E,Ia,gb(E))}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=g,A=go(),M=vo(),R=Ir(),E=as();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),R?q(R):Promise.resolve(null)]).then(([z,Ce,he])=>{H||Kr(B,z,Ce,he,E,Ia,"#2f4fd4")}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=f,A=mo(),M=bo(),R=Ir(),E=ls();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),R?q(R):Promise.resolve(null)]).then(([z,Ce,he])=>{H||Kr(B,z,Ce,he,E,Ga,"#7f49b5")}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=h,A=mo(),M=bo(),R=Ir(),E=cs();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),R?q(R):Promise.resolve(null)]).then(([z,Ce,he])=>{H||Kr(B,z,Ce,he,E,Ga)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=v,A=po(),M=xo(),R=Ir(),E=us();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),R?q(R):Promise.resolve(null)]).then(([z,Ce,he])=>{H||Kr(B,z,Ce,he,E,tb)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=S,A=Yn(),M=fo();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=p,A=Yn(),M=Ql();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=T,A=on(),M=sn();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientHeight||1;Rt(B,E,H,{cornerPx:z*En,insetPx:Da,tileBackground:!0,tileHorizontalEdges:!0,opaqueBaseFill:"#000",fillCornerMaxPx:Bn})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=P,A=on(),M=sn();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientHeight||1;Rt(B,E,H,{cornerPx:z*En,insetPx:z*Zv,tileBackground:!0,tileHorizontalEdges:!0,opaqueBaseFill:"#000",fillCornerMaxPx:Bn})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=k,A=Eo(),M=Ao();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientHeight||1;Rt(B,E,H,{cornerPx:z*$a,insetPx:z*jv,tileBackground:!0,tileHorizontalEdges:!0,opaqueBaseFill:"#000"})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=K,A=on(),M=sn();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientHeight||1;Rt(B,E,H,{cornerPx:z*En,insetPx:Da,tileBackground:!0,tileHorizontalEdges:!0,opaqueBaseFill:"#000",fillCornerMaxPx:Bn})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=L,A=on(),M=sn();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientHeight||1;Rt(B,E,H,{cornerPx:z*En,insetPx:Ov,tileBackground:!0,tileHorizontalEdges:!0,opaqueBaseFill:"#000",fillCornerMaxPx:Bn})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=N,A=Yn(),M=fo();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientWidth||1;Rt(B,E,H,{cornerPx:z*Jv,insetPx:z*eb,tileBackground:!0,opaqueBaseFill:"#000"})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=D,A=Kn(),M=Qn();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientWidth||1;Rt(B,E,H,{cornerPx:z*Hi,insetPx:z*zi,tileBackground:!0,opaqueBaseFill:"#000"})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=V,A=Kn(),M=Qn();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientWidth||1;Rt(B,E,H,{cornerPx:z*Hi,insetPx:z*zi,tileBackground:!0,opaqueBaseFill:"#000"})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=$,A=Eo(),M=Ao();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientHeight||1;Rt(B,E,H,{cornerPx:z*$a,insetPx:qv,tileBackground:!0,tileHorizontalEdges:!0,opaqueBaseFill:"#000"})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=I,A=Kn(),M=Qn();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{if(R)return;const z=B.clientWidth||1;Rt(B,E,H,{cornerPx:z*Hi,insetPx:z*zi,tileBackground:!0,opaqueBaseFill:"#000"})}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=w,A=ln()?Fe():Le(),M=ln()?Ze():Xe(),R=mu()&&!ln(),E=ot();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),E?q(E):Promise.resolve(null)]).then(([z,Ce,he])=>{H||We(B,z,Ce,he,R)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=m,A=cn()?Fe():Le(),M=cn()?Ze():Xe(),R=pu()&&!cn(),E=ot();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),E?q(E):Promise.resolve(null)]).then(([z,Ce,he])=>{H||We(B,z,Ce,he,R)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=U,A=Wt(),M=Pr();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=b,A=dn()?Po():wo(),M=dn()?yo():To(),R=vu()&&!dn(),E=Uo();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),E?q(E):Promise.resolve(null)]).then(([z,Ce,he])=>{H||We(B,z,Ce,he,R)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=pe,A=fn()?Po():wo(),M=fn()?yo():To(),R=bu()&&!fn(),E=Uo();if(!B||!A||!M)return;let H=!1;Promise.all([q(A),q(M),E?q(E):Promise.resolve(null)]).then(([z,Ce,he])=>{H||We(B,z,Ce,he,R)}).catch(z=>console.error(z)),ce(()=>{H=!0})}),de(()=>{const B=y,A=Rc(),M=kc();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=e,A=Wt(),M=Pr();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),de(()=>{const B=x,A=Wt(),M=Pr();if(!B||!A||!M)return;let R=!1;Promise.all([q(A),q(M)]).then(([E,H])=>{R||We(B,E,H,null,!1)}).catch(E=>console.error(E)),ce(()=>{R=!0})}),Xt(()=>{const B=()=>{du(window.innerWidth)};B(),window.addEventListener("resize",B);const A=window.setInterval(()=>{su(he=>Math.min(Ua,he+ya))},wv),M=window.setInterval(()=>{au(he=>Math.min(Ua,he+ya))},Pv),R=window.setInterval(()=>{lu(he=>Math.min(he+1,ti()))},Tv),E=window.setInterval(()=>{cu(he=>Math.min(Uv,he+10))},yv),H=window.setInterval(()=>{cd(he=>he+1)},1400),z=window.setInterval(()=>{ud(he=>(he+Ca)%Sr)},Ca);ce(()=>{window.removeEventListener("resize",B),clearInterval(A),clearInterval(M),clearInterval(R),clearInterval(E),clearInterval(H),clearInterval(z)});const Ce=[{name:"Human",race:"Human"},{name:"Orc",race:"Orc"},{name:"Night Elf",race:"NightElf"},{name:"Undead",race:"Undead"}];Promise.all(Ce.map(he=>F(qa(he.race)))).then(he=>{const wt={};Ce.forEach((Et,At)=>{wt[Et.name]=he[At]}),zc(wt)})}),(()=>{var B=iv(),A=B.firstChild,M=A.firstChild,R=M.firstChild,E=A.nextSibling,H=E.firstChild,z=H.firstChild,Ce=z.nextSibling,he=Ce.nextSibling,wt=he.nextSibling,Et=wt.nextSibling,At=Et.nextSibling,qt=At.nextSibling,Yt=qt.nextSibling,Kt=Yt.nextSibling,Qt=Kt.nextSibling,Zt=Qt.nextSibling,jt=Zt.nextSibling,Jt=jt.nextSibling,er=Jt.nextSibling,tr=er.nextSibling,Gr=tr.nextSibling;return _(M,ue(Eg,{get race(){return Pt()},get leftOnly(){return Bt()}}),R),_(R,()=>Qi.map(J=>{const W=()=>Pt()===J,X=()=>hu()===J,G=()=>fu()===J&&!X(),O=()=>W()||X()?Gi:Ii,j=()=>W()||G()?"#ffd412":"#ffffff",ae=()=>X()?`translate(${wa}vw, ${Pa}vw)`:"translate(0, 0)";return(()=>{var oe=ov(),ne=oe.firstChild,ee=ne.nextSibling,Q=ee.nextSibling;return oe.$$click=()=>ag(J),oe.$$mouseup=()=>ri(re=>re===J?null:re),oe.$$mousedown=()=>ri(J),oe.addEventListener("mouseleave",()=>{Do(re=>re===J?null:re),ri(re=>re===J?null:re)}),oe.addEventListener("mouseenter",()=>Do(J)),ie(ee,"background-position",`0 ${Ta}`),_(Q,()=>Ut[J].display),me(re=>{var xe=Bt()?`${100/Qi.length}%`:`${Pl}vw`,Se=`url("${Te()}")`,ge=`0 ${O()}`,Z=`url("${Te()}")`,Pe=G()?1:0,fe=j(),se=Bt()?"clamp(11px, 2.2vw, 14px)":"1.25vw",te=ae();return xe!==re.e&&ie(oe,"width",re.e=xe),Se!==re.t&&ie(ne,"background-image",re.t=Se),ge!==re.a&&ie(ne,"background-position",re.a=ge),Z!==re.o&&ie(ee,"background-image",re.o=Z),Pe!==re.i&&ie(ee,"opacity",re.i=Pe),fe!==re.n&&ie(Q,"color",re.n=fe),se!==re.s&&ie(Q,"font-size",re.s=se),te!==re.h&&ie(Q,"transform",re.h=te),re},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),oe})()})),_(M,(()=>{var J=ft(()=>!Bt());return()=>J()&&(()=>{var W=sv(),X=W.firstChild,G=X.nextSibling,O=G.nextSibling,j=O.nextSibling,ae=j.nextSibling,oe=ae.nextSibling,ne=oe.nextSibling;return _(G,Mo),_(j,_o),_(oe,()=>`${ei()}/${ti()}`),_(ne,()=>pn().text),me(ee=>{var Q=Co(),re=Bo(),xe=qc(),Se=pn().color;return Q!==ee.e&&le(X,"src",ee.e=Q),re!==ee.t&&le(O,"src",ee.t=re),xe!==ee.a&&le(ae,"src",ee.a=xe),Se!==ee.o&&ie(ne,"color",ee.o=Se),ee},{e:void 0,t:void 0,a:void 0,o:void 0}),W})()})(),null),_(B,(()=>{var J=ft(()=>!Bt());return()=>J()&&(()=>{var W=av();return _(W,ue(vg,{get race(){return Pt()}})),W})()})(),E),_(z,ue(Mg,{get getStartedPressed(){return fn()},getStartedCanvasRef:J=>{pe=J},installCanvasRef:J=>{K=J},onGetStartedMouseEnter:()=>Io(!0),onGetStartedMouseLeave:()=>{Io(!1),li(!1)},onGetStartedMouseDown:()=>li(!0),onGetStartedMouseUp:()=>li(!1)})),_(Ce,ue(Hg,{})),_(he,ue(mm,{get children(){var J=ki();return _(J,ue(Ne,{title:"Faction Tab",description:"Race selector from the top bar. Text turns gold on hover and when active.",get children(){var W=Ep(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=j.nextSibling,oe=X.nextSibling,ne=oe.firstChild,ee=ne.firstChild,Q=ee.nextSibling,re=oe.nextSibling,xe=re.firstChild,Se=xe.firstChild,ge=Se.nextSibling;return G.$$mouseup=()=>si(!1),G.$$mousedown=()=>si(!0),G.addEventListener("mouseleave",()=>{Vo(!1),si(!1)}),G.addEventListener("mouseenter",()=>Vo(!0)),ie(j,"background-position",`0 ${Ta}`),_(ae,()=>Ut[Pt()].display),ie(ee,"background-position",`0 ${Gi}`),_(Q,()=>Ut[Pt()].display),ie(Se,"background-position",`0 ${Ii}`),_(ge,()=>Ut[Pt()].display),me(Z=>{var Pe=`url("${Te()}")`,fe=`0 ${un()?Gi:Ii}`,se=`url("${Te()}")`,te=$o()&&!un()?1:0,Ue=$o()||un()?"#ffd412":"#ffffff",Ae=un()?`translate(${wa}vw, ${Pa}vw)`:"none",be=`url("${Te()}")`,Be=`url("${Te()}")`;return Pe!==Z.e&&ie(O,"background-image",Z.e=Pe),fe!==Z.t&&ie(O,"background-position",Z.t=fe),se!==Z.a&&ie(j,"background-image",Z.a=se),te!==Z.o&&ie(j,"opacity",Z.o=te),Ue!==Z.i&&ie(ae,"color",Z.i=Ue),Ae!==Z.n&&ie(ae,"transform",Z.n=Ae),be!==Z.s&&ie(ee,"background-image",Z.s=be),Be!==Z.h&&ie(Se,"background-image",Z.h=Be),Z},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),W}}),null),_(J,ue(Ne,{title:"Options Menu Button",description:"Race-themed buttons from the in-game options menu. Each faction has unique background, border, and hover textures.",get children(){var W=Ap(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=X.nextSibling,oe=ae.firstChild,ne=oe.firstChild;G.$$mouseup=()=>ai(!1),G.$$mousedown=()=>ai(!0),G.addEventListener("mouseleave",()=>{ko(!1),ai(!1)}),G.addEventListener("mouseenter",()=>ko(!0));var ee=b;typeof ee=="function"?we(ee,O):b=O;var Q=y;return typeof Q=="function"?we(Q,ne):y=ne,me(re=>ie(j,"transform",dn()?`translate(${gv}px, ${mv}px)`:"none")),W}}),null),_(J,ue(Ne,{title:"Main Menu Button",description:"Primary action button inside a decorative border frame, used for items like Single Player and Multiplayer.",get children(){var W=Mp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=j.firstChild,oe=ae.nextSibling,ne=X.nextSibling,ee=ne.firstChild,Q=ee.firstChild,re=Q.nextSibling,xe=re.firstChild;xe.nextSibling,j.$$mouseup=()=>ii(!1),j.$$mousedown=()=>ii(!0),j.addEventListener("mouseleave",()=>{Ro(!1),ii(!1)}),j.addEventListener("mouseenter",()=>Ro(!0));var Se=w;typeof Se=="function"?we(Se,ae):w=ae;var ge=x;return typeof ge=="function"?we(ge,xe):x=xe,me(Z=>{var Pe=qe(),fe=ln()?`translate(${Dr}px, ${Lr}px)`:"none",se=qe();return Pe!==Z.e&&le(O,"src",Z.e=Pe),fe!==Z.t&&ie(oe,"transform",Z.t=fe),se!==Z.a&&le(Q,"src",Z.a=se),Z},{e:void 0,t:void 0,a:void 0}),W}}),null),_(J,ue(Ne,{title:"Dialog Button",description:"Standalone confirm button with a narrower frame, used for single-action dialogs and prompts.",get children(){var W=_p(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=j.firstChild,oe=ae.nextSibling,ne=X.nextSibling,ee=ne.firstChild,Q=ee.firstChild,re=Q.nextSibling,xe=re.firstChild;xe.nextSibling,j.$$mouseup=()=>oi(!1),j.$$mousedown=()=>oi(!0),j.addEventListener("mouseleave",()=>{Fo(!1),oi(!1)}),j.addEventListener("mouseenter",()=>Fo(!0));var Se=m;typeof Se=="function"?we(Se,ae):m=ae;var ge=U;return typeof ge=="function"?we(ge,xe):U=xe,me(Z=>{var Pe=$e(),fe=cn()?`translate(${Dr}px, ${Lr}px)`:"none",se=$e();return Pe!==Z.e&&le(O,"src",Z.e=Pe),fe!==Z.t&&ie(oe,"transform",Z.t=fe),se!==Z.a&&le(Q,"src",Z.a=se),Z},{e:void 0,t:void 0,a:void 0}),W}}),null),_(J,ue(Ne,{title:"Button Border Variants",description:"Decorative border frames in several sizes, from large multi-button panels down to tiny compact frames.",get children(){var W=Dp();return _(W,()=>yd().filter(X=>X.src).sort((X,G)=>(Sa[X.label]??Number.MAX_SAFE_INTEGER)-(Sa[G.label]??Number.MAX_SAFE_INTEGER)).map(X=>ue(bb,{variant:X,glueBgUrl:Le,glueBgDownUrl:Fe,glueBorderUrl:Xe,glueBorderDownUrl:Ze,glueHoverUrl:ot}))),W}}),null),_(J,ue(Ne,{title:"Login Screen Button",description:"Standard button from the login and menu screens. Tiled stone background with a gold border and hover glow.",get children(){var W=Lp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=X.nextSibling,oe=ae.firstChild,ne=oe.firstChild;ne.nextSibling,G.$$mouseup=()=>ni(!1),G.$$mousedown=()=>ni(!0),G.addEventListener("mouseleave",()=>{Lo(!1),ni(!1)}),G.addEventListener("mouseenter",()=>Lo(!0));var ee=t;typeof ee=="function"?we(ee,O):t=O;var Q=e;return typeof Q=="function"?we(Q,ne):e=ne,me(re=>ie(j,"transform",an()?`translate(${Dr}px, ${Lr}px)`:"none")),W}}),null),_(J,ue(Ne,{title:"Bordered Button",description:"Button variant with a heavier decorative edge, same stone backdrop and hover glow.",get children(){var W=Rp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=X.nextSibling,oe=ae.firstChild,ne=oe.firstChild;ne.nextSibling,G.$$mouseup=()=>mi(!1),G.$$mousedown=()=>mi(!0),G.addEventListener("mouseleave",()=>{Yo(!1),mi(!1)}),G.addEventListener("mouseenter",()=>Yo(!0));var ee=r;typeof ee=="function"?we(ee,O):r=O;var Q=n;return typeof Q=="function"?we(Q,ne):n=ne,me(re=>ie(j,"transform",hn()?`translate(${Dr}px, ${Lr}px)`:"none")),W}}),null),_(J,ue(Ne,{title:"Small Button",description:"Compact button for secondary actions like profile settings and realm selection.",get children(){var W=Fp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=X.nextSibling,oe=ae.firstChild,ne=oe.firstChild;ne.nextSibling,G.$$mouseup=()=>pi(!1),G.$$mousedown=()=>pi(!0),G.addEventListener("mouseleave",()=>{Ko(!1),pi(!1)}),G.addEventListener("mouseenter",()=>Ko(!0));var ee=i;typeof ee=="function"?we(ee,O):i=O;var Q=o;return typeof Q=="function"?we(Q,ne):o=ne,me(re=>ie(j,"transform",gn()?`translate(${Dr}px, ${Lr}px)`:"none")),W}}),null),_(J,ue(Ne,{title:"Campaign Button",description:"Campaign menu button with its own unique backdrop and border textures.",get children(){var W=$p(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=X.nextSibling,oe=ae.firstChild,ne=oe.firstChild;ne.nextSibling,G.$$mouseup=()=>vi(!1),G.$$mousedown=()=>vi(!0),G.addEventListener("mouseleave",()=>{Qo(!1),vi(!1)}),G.addEventListener("mouseenter",()=>Qo(!0));var ee=s;typeof ee=="function"?we(ee,O):s=O;var Q=a;return typeof Q=="function"?we(Q,ne):a=ne,me(re=>ie(j,"transform",mn()?"translate(-1px, 1px)":"none")),W}}),null),_(J,ue(Ne,{title:"Ability Button",description:"Ability buttons from the in-game command card grid with pressed, disabled, and cooldown states.",get children(){var W=Vp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=X.nextSibling,oe=ae.firstChild,ne=oe.firstChild,ee=ne.nextSibling,Q=ae.nextSibling,re=Q.firstChild,xe=re.firstChild,Se=Q.nextSibling,ge=Se.firstChild,Z=ge.firstChild,Pe=Se.nextSibling,fe=Pe.firstChild,se=fe.firstChild,te=Pe.nextSibling,Ue=te.firstChild,Ae=Ue.firstChild;return G.$$mouseup=()=>ui(!1),G.$$mousedown=()=>ui(!0),G.addEventListener("mouseleave",()=>{No(!1),ui(!1)}),G.addEventListener("mouseenter",()=>No(!0)),me(be=>{var Be=!!Oo(),rt=Tr(),Mt=!!($u()&&!Oo()),_t=`url("${ci()}")`,Dt=Tr(),fr=`url("${ci()}")`,hr=Tr(),Nr=Go()||Tr(),Or=Tr(),ms=Go()||Tr();return Be!==be.e&&G.classList.toggle("cmd-btn--pressed",be.e=Be),rt!==be.t&&le(O,"src",be.t=rt),Mt!==be.a&&j.classList.toggle("cmd-btn-highlight--on",be.a=Mt),_t!==be.o&&ie(j,"background-image",be.o=_t),Dt!==be.i&&le(ne,"src",be.i=Dt),fr!==be.n&&ie(ee,"background-image",be.n=fr),hr!==be.s&&le(xe,"src",be.s=hr),Nr!==be.h&&le(Z,"src",be.h=Nr),Or!==be.r&&le(se,"src",be.r=Or),ms!==be.d&&le(Ae,"src",be.d=ms),be},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0}),W}}),null),J}})),_(wt,ue(pm,{get children(){var J=ki();return _(J,ue(Ne,{title:"Dropdown",description:"Pull-down selector with a dedicated arrow, used for option menus and popup lists.",get children(){var W=kp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.firstChild,ae=j.nextSibling,oe=ae.nextSibling,ne=X.nextSibling,ee=ne.firstChild,Q=ee.firstChild,re=Q.nextSibling,xe=re.nextSibling;O.$$click=()=>jo(Z=>!Z),O.addEventListener("mouseleave",()=>Zo(!1)),O.addEventListener("mouseenter",()=>Zo(!0));var Se=c;typeof Se=="function"?we(Se,j):c=j,_(ae,Jo),_(G,(()=>{var Z=ft(()=>!!yr());return()=>Z()&&(()=>{var Pe=lv(),fe=Pe.firstChild,se=l;return typeof se=="function"?we(se,fe):l=fe,_(Pe,()=>Yv.map(te=>(()=>{var Ue=ba();return Ue.$$click=()=>{ed(te),jo(!1)},_(Ue,te),me(()=>xs(Ue,`popup-menu-option${Jo()===te?" selected":""}`)),Ue})()),null),Pe})()})(),null);var ge=u;return typeof ge=="function"?we(ge,Q):u=Q,me(Z=>{var Pe=yr(),fe=uo(),se=uo();return Pe!==Z.e&&le(O,"aria-expanded",Z.e=Pe),fe!==Z.t&&le(oe,"src",Z.t=fe),se!==Z.a&&le(xe,"src",Z.a=se),Z},{e:void 0,t:void 0,a:void 0}),W}}),null),_(J,ue(Ne,{title:"Slider",description:"Options menu slider with a shared track and a race-specific thumb.",get children(){var W=Ip(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.firstChild,ae=O.nextSibling,oe=ae.firstChild,ne=oe.nextSibling,ee=ne.nextSibling,Q=X.nextSibling,re=Q.firstChild,xe=re.firstChild,Se=xe.nextSibling,ge=Se.firstChild,Z=ge.nextSibling;_(O,bi,j);var Pe=S;typeof Pe=="function"?we(Pe,oe):S=oe,ee.$$input=se=>td(Number(se.currentTarget.value));var fe=p;return typeof fe=="function"?we(fe,ge):p=ge,me(se=>{var te=`url("${ho()}")`,Ue=gd(),Ae=`url("${Jl()}")`,be=md();return te!==se.e&&ie(ne,"background-image",se.e=te),Ue!==se.t&&ie(ne,"left",se.t=Ue),Ae!==se.a&&ie(Z,"background-image",se.a=Ae),be!==se.o&&ie(Z,"left",se.o=be),se},{e:void 0,t:void 0,a:void 0,o:void 0}),me(()=>ee.value=bi()),W}}),null),_(J,ue(Ne,{title:"Checkbox",description:"In-game option toggle. The pressed background is race-specific while the check mark and base are shared.",get children(){var W=Gp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=X.nextSibling,ae=j.firstChild,oe=ae.firstChild,ne=oe.nextSibling,ee=j.nextSibling,Q=ee.firstChild,re=Q.firstChild,xe=ee.nextSibling,Se=xe.firstChild,ge=Se.firstChild,Z=ge.nextSibling,Pe=xe.nextSibling,fe=Pe.firstChild,se=fe.firstChild;return G.$$click=()=>qu(te=>!te),G.addEventListener("mouseleave",()=>gi(!1)),G.$$mouseup=()=>gi(!1),G.$$mousedown=()=>gi(!0),_(G,(()=>{var te=ft(()=>!!Wo());return()=>te()&&(()=>{var Ue=xa();return me(()=>le(Ue,"src",fi())),Ue})()})(),null),me(te=>{var Ue=Wo(),Ae=Yu()?ku():di(),be=di(),Be=fi(),rt=di(),Mt=Ho(),_t=fi(),Dt=Ho();return Ue!==te.e&&le(G,"aria-checked",te.e=Ue),Ae!==te.t&&le(O,"src",te.t=Ae),be!==te.a&&le(oe,"src",te.a=be),Be!==te.o&&le(ne,"src",te.o=Be),rt!==te.i&&le(re,"src",te.i=rt),Mt!==te.n&&le(ge,"src",te.n=Mt),_t!==te.s&&le(Z,"src",te.s=_t),Dt!==te.h&&le(se,"src",te.h=Dt),te},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),W}}),null),_(J,ue(Ne,{title:"Radio Button",description:"Mutually exclusive option selector. The selected dot glows over a stone background, shared across all races.",get children(){var W=Np(),X=W.firstChild,G=X.firstChild,O=X.nextSibling,j=O.firstChild,ae=j.firstChild,oe=ae.nextSibling,ne=O.nextSibling,ee=ne.firstChild,Q=ee.firstChild,re=ne.nextSibling,xe=re.firstChild,Se=xe.firstChild,ge=Se.nextSibling,Z=re.nextSibling,Pe=Z.firstChild,fe=Pe.firstChild;return _(G,()=>[0,1,2].map(se=>(()=>{var te=cv(),Ue=te.firstChild;return te.$$click=()=>Ku(se),_(te,(()=>{var Ae=ft(()=>qo()===se);return()=>Ae()&&(()=>{var be=xa();return me(()=>le(be,"src",Xo())),be})()})(),null),me(Ae=>{var be=qo()===se,Be=hi();return be!==Ae.e&&le(te,"aria-checked",Ae.e=be),Be!==Ae.t&&le(Ue,"src",Ae.t=Be),Ae},{e:void 0,t:void 0}),te})())),me(se=>{var te=hi(),Ue=Xo(),Ae=hi(),be=zo(),Be=Xu(),rt=zo();return te!==se.e&&le(ae,"src",se.e=te),Ue!==se.t&&le(oe,"src",se.t=Ue),Ae!==se.a&&le(Q,"src",se.a=Ae),be!==se.o&&le(Se,"src",se.o=be),Be!==se.i&&le(ge,"src",se.i=Be),rt!==se.n&&le(fe,"src",se.n=rt),se},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0}),W}}),null),_(J,ue(Ne,{title:"Text Input",description:"Text fields in two styles: a decorated race-themed variant for in-game menus and a plain Battle.net variant for login screens.",get children(){return[(()=>{var W=Op(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=X.nextSibling,oe=ae.firstChild,ne=oe.firstChild,ee=T;typeof ee=="function"?we(ee,O):T=O,j.$$input=re=>nd(re.currentTarget.value);var Q=P;return typeof Q=="function"?we(Q,ne):P=ne,me(()=>j.value=rd()),W})(),(()=>{var W=Hp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=k;return typeof ae=="function"?we(ae,O):k=O,j.$$input=oe=>od(oe.currentTarget.value),me(()=>j.value=id()),W})()]}}),null),_(J,ue(Ne,{title:"Scrollbar",description:"Vertical scroll track with up/down arrows and a draggable knob, from the login and menu screens.",get children(){var W=zp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.firstChild,ae=O.nextSibling,oe=ae.firstChild,ne=oe.nextSibling,ee=ne.nextSibling,Q=ae.nextSibling,re=Q.firstChild,xe=X.nextSibling,Se=xe.firstChild,ge=Se.firstChild,Z=ge.firstChild,Pe=ge.nextSibling,fe=Pe.firstChild,se=fe.nextSibling,te=Pe.nextSibling,Ue=te.firstChild;O.$$click=()=>hs(-8);var Ae=D;typeof Ae=="function"?we(Ae,oe):D=oe,ee.$$input=Be=>ts(Number(Be.currentTarget.value)),Q.$$click=()=>hs(8);var be=V;return typeof be=="function"?we(be,fe):V=fe,me(Be=>{var rt=Zn(),Mt=`url("${Jn()}")`,_t=pd(),Dt=jn(),fr=Zn(),hr=`url("${iu()||Jn()}")`,Nr=vd(),Or=jn();return rt!==Be.e&&le(j,"src",Be.e=rt),Mt!==Be.t&&ie(ne,"background-image",Be.t=Mt),_t!==Be.a&&ie(ne,"top",Be.a=_t),Dt!==Be.o&&le(re,"src",Be.o=Dt),fr!==Be.i&&le(Z,"src",Be.i=fr),hr!==Be.n&&ie(se,"background-image",Be.n=hr),Nr!==Be.s&&ie(se,"top",Be.s=Nr),Or!==Be.h&&le(Ue,"src",Be.h=Or),Be},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),me(()=>ee.value=es()),W}}),null),_(J,ue(Ne,{title:"Text Area",description:"Scrollable text panel with a decorated border and attached scroll thumb, used in the options menu.",get children(){var W=Xp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.firstChild,ae=j.nextSibling,oe=ae.firstChild,ne=O.nextSibling,ee=ne.firstChild,Q=ee.nextSibling,re=Q.nextSibling,xe=L;typeof xe=="function"?we(xe,j):L=j,_(oe,()=>ka.map(ge=>(()=>{var Z=ba();return _(Z,ge),Z})()));var Se=N;return typeof Se=="function"?we(Se,ee):N=ee,re.$$input=ge=>sd(Number(ge.currentTarget.value)),me(ge=>{var Z=`translateY(-${wd()}px)`,Pe=`url("${ho()}")`,fe=bd();return Z!==ge.e&&ie(oe,"transform",ge.e=Z),Pe!==ge.t&&ie(Q,"background-image",ge.t=Pe),fe!==ge.a&&ie(Q,"top",ge.a=fe),ge},{e:void 0,t:void 0,a:void 0}),me(()=>re.value=xi()),W}}),null),_(J,ue(Ne,{title:"List Box",description:"Bordered scrollable list from the menu screens, pairing a text input container with a scrollbar.",get children(){var W=Wp(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.firstChild,ae=j.nextSibling,oe=ae.firstChild,ne=O.nextSibling,ee=ne.firstChild,Q=ee.firstChild,re=ee.nextSibling,xe=re.firstChild,Se=xe.nextSibling,ge=Se.nextSibling,Z=re.nextSibling,Pe=Z.firstChild,fe=$;typeof fe=="function"?we(fe,j):$=j,_(oe,()=>Va.map(te=>(()=>{var Ue=uv();return Ue.$$click=()=>ld(te),_(Ue,te),me(()=>Ue.classList.toggle("wc3-listbox-item--selected",ad()===te)),Ue})())),ee.$$click=()=>gs(-10);var se=I;return typeof se=="function"?we(se,xe):I=xe,ge.$$input=te=>rs(Number(te.currentTarget.value)),Z.$$click=()=>gs(10),me(te=>{var Ue=`translateY(-${Td()}px)`,Ae=Zn(),be=`url("${Jn()}")`,Be=xd(),rt=jn();return Ue!==te.e&&ie(oe,"transform",te.e=Ue),Ae!==te.t&&le(Q,"src",te.t=Ae),be!==te.a&&ie(Se,"background-image",te.a=be),Be!==te.o&&ie(Se,"top",te.o=Be),rt!==te.i&&le(Pe,"src",te.i=rt),te},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),me(()=>ge.value=Si()),W}}),null),J}})),_(Et,ue(vm,{get children(){var J=qp(),W=J.firstChild,X=W.firstChild,G=X.firstChild,O=G.nextSibling,j=W.nextSibling,ae=j.firstChild,oe=ae.firstChild,ne=oe.nextSibling,ee=j.nextSibling,Q=ee.firstChild,re=Q.firstChild,xe=re.nextSibling,Se=xe.firstChild,ge=ee.nextSibling,Z=ge.firstChild,Pe=Z.firstChild;return _(O,Mo),_(ne,_o),_(xe,ei,Se),_(xe,ti,null),_(Pe,()=>pn().text),me(fe=>{var se=Co(),te=Bo(),Ue=Kc(),Ae=pn().color;return se!==fe.e&&le(G,"src",fe.e=se),te!==fe.t&&le(oe,"src",fe.t=te),Ue!==fe.a&&le(re,"src",fe.a=Ue),Ae!==fe.o&&ie(Z,"color",fe.o=Ae),fe},{e:void 0,t:void 0,a:void 0,o:void 0}),J}})),_(At,ue(bm,{get iconUrls(){return Pu()},get disabledIconUrls(){return yu()},get highlightUrl(){return ci()},get groupBorderUrl(){return Cu()},get subgroupBgUrl(){return Ru()}})),_(qt,ue(Tm,{get backdropUrl(){return Eu()},get iconUrl(){return Mu()}})),_(Yt,ue(ym,{get backgroundUrl(){return wc()},get borderImageUrl(){return Uc()},get goldIconUrl(){return Cc()},get lumberIconUrl(){return Ec()},get supplyIconUrl(){return Mc()}})),_(Kt,ue(Um,{})),_(Qt,ue(Cm,{get children(){var J=ki();return _(J,ue(Ne,{title:"Health Bar",description:"Green unit health bar from the in-game portrait panel with highlight and edge overlays.",get children(){return[(()=>{var W=Yp(),X=W.firstChild,G=X.nextSibling,O=d;return typeof O=="function"?we(O,X):d=X,_(G,()=>`${Math.round(ss()*650/100)} / 650`),W})(),va()]}}),null),_(J,ue(Ne,{title:"Mana Bar",description:"Blue mana bar sharing the same highlight and edge overlays as the health bar.",get children(){return[(()=>{var W=Kp(),X=W.firstChild,G=X.nextSibling,O=g;return typeof O=="function"?we(O,X):g=X,_(G,()=>`${Math.round(as()*300/100)} / 300`),W})(),va()]}}),null),_(J,ue(Ne,{title:"XP Bar",description:"Hero experience bar with a purple fill and the classic XP border frame.",get children(){return[(()=>{var W=Qp(),X=W.firstChild,G=X.nextSibling,O=f;return typeof O=="function"?we(O,X):f=X,_(G,()=>`Level 3 · ${Math.floor(ls())}%`),W})(),Zp()]}}),null),_(J,ue(Ne,{title:"Progress Bar",description:"Generic timed progress indicator for training, upgrades, and other queued actions.",get children(){return[(()=>{var W=jp(),X=W.firstChild,G=X.nextSibling,O=h;return typeof O=="function"?we(O,X):h=X,_(G,()=>`${Math.floor(cs())}%`),W})(),Jp()]}}),null),_(J,ue(Ne,{title:"Build Progress",description:"Construction progress indicator with its own fill and border textures.",get children(){return[(()=>{var W=ev(),X=W.firstChild,G=X.nextSibling,O=v;return typeof O=="function"?we(O,X):v=X,_(G,()=>`${Math.floor(us())}%`),W})(),tv()]}}),null),_(J,ue(Ne,{title:"Loading Screen Bar",description:"Full-width loading bar from the map load screen with a tiled track, glass border, and progress glow.",get children(){return[(()=>{var W=rv(),X=W.firstChild,G=X.firstChild,O=G.firstChild,j=O.nextSibling,ae=G.nextSibling,oe=ae.nextSibling,ne=oe.nextSibling,ee=ne.nextSibling;return _(ee,()=>`${Math.floor(Pi())}%`),me(Q=>{var re=`url("${dc()}")`,xe=`url("${hc()}")`,Se=`${ds()}%`,ge=mc(),Z=vc(),Pe=xc(),fe=`${hd()}%`,se=`${fd()}`;return re!==Q.e&&ie(O,"background-image",Q.e=re),xe!==Q.t&&ie(j,"background-image",Q.t=xe),Se!==Q.a&&ie(j,"width",Q.a=Se),ge!==Q.o&&le(ae,"src",Q.o=ge),Z!==Q.i&&le(oe,"src",Q.i=Z),Pe!==Q.n&&le(ne,"src",Q.n=Pe),fe!==Q.s&&ie(ne,"width",Q.s=fe),se!==Q.h&&ie(ne,"opacity",Q.h=se),Q},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),W})(),nv()]}}),null),J}})),_(Zt,ue(yp,{loadBlpDataUrl:F})),_(jt,ue(Im,{get borderAtlasUrls(){return Hc()}})),_(Jt,ue(Hm,{})),_(er,ue(ep,{buildFillUrl:po,buildBorderUrl:xo})),_(tr,ue(ip,{})),_(Gr,ue(gp,{get race(){return Pt()}})),me(J=>{var W=os(),X=Bt()?`${pv}%`:`${Sl}vw`,G=Bt()?`${vv}%`:`${wl}vw`,O=Bt()?`${xv}%`:void 0,j=Bt()?`${Sv}%`:`${Tl}vw`,ae=`viewport${gt()?" viewport--race-card-borders":""}`,oe=gt()?`url("${gt()}")`:"",ne=dd();return W!==J.e&&ie(M,"height",J.e=W),X!==J.t&&ie(R,"left",J.t=X),G!==J.a&&ie(R,"top",J.a=G),O!==J.o&&ie(R,"width",J.o=O),j!==J.i&&ie(R,"height",J.i=j),ae!==J.n&&xs(E,J.n=ae),oe!==J.s&&ie(E,"--section-card-border-image",J.s=oe),ne!==J.h&&ie(E,"padding-top",J.h=ne),J},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),B})()}ji(["mousedown","mouseup","click","input"]);const El=document.getElementById("root");if(!El)throw new Error("Root element not found");Vd(()=>ue(xb,{}),El);
