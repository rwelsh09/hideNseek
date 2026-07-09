import{r as h,R as b}from"./index.B84Ll5_V.js";import{c as D}from"./clsx.B-dksMZM.js";var M=t=>typeof t=="number"&&!isNaN(t),A=t=>typeof t=="string",P=t=>typeof t=="function",ft=t=>A(t)||M(t),Q=t=>A(t)||P(t)?t:null,ct=(t,e)=>t===!1||M(t)&&t>0?t:e,V=t=>h.isValidElement(t)||A(t)||P(t)||M(t);function dt(t,e,a=300){let{scrollHeight:r,style:i}=t;requestAnimationFrame(()=>{i.minHeight="initial",i.height=r+"px",i.transition=`all ${a}ms`,requestAnimationFrame(()=>{i.height="0",i.padding="0",i.margin="0",setTimeout(e,a)})})}function U({enter:t,exit:e,appendPosition:a=!1,collapse:r=!0,collapseDuration:i=300}){return function({children:l,position:o,preventExitTransition:d,done:f,nodeRef:y,isIn:_,playToast:k}){let w=a?`${t}--${o}`:t,E=a?`${e}--${o}`:e,C=h.useRef(0);return h.useLayoutEffect(()=>{let T=y.current,p=w.split(" "),m=s=>{s.target===y.current&&(k(),T.removeEventListener("animationend",m),T.removeEventListener("animationcancel",m),C.current===0&&s.type!=="animationcancel"&&T.classList.remove(...p))};T.classList.add(...p),T.addEventListener("animationend",m),T.addEventListener("animationcancel",m)},[]),h.useEffect(()=>{let T=y.current,p=()=>{T.removeEventListener("animationend",p),r?dt(T,f,i):f()};_||(d?p():(C.current=1,T.className+=` ${E}`,T.addEventListener("animationend",p)))},[_]),b.createElement(b.Fragment,null,l)}}function J(t,e){return{content:et(t.content,t.props),containerId:t.props.containerId,id:t.props.toastId,theme:t.props.theme,type:t.props.type,data:t.props.data||{},isLoading:t.props.isLoading,icon:t.props.icon,reason:t.removalReason,status:e}}function et(t,e,a=!1){return h.isValidElement(t)&&!A(t.type)?h.cloneElement(t,{closeToast:e.closeToast,toastProps:e,data:e.data,isPaused:a}):P(t)?t({closeToast:e.closeToast,toastProps:e,data:e.data,isPaused:a}):t}function ut({closeToast:t,theme:e,ariaLabel:a="close"}){return b.createElement("button",{className:`Toastify__close-button Toastify__close-button--${e}`,type:"button",onClick:r=>{r.stopPropagation(),t(!0)},"aria-label":a},b.createElement("svg",{"aria-hidden":"true",viewBox:"0 0 14 16"},b.createElement("path",{fillRule:"evenodd",d:"M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"})))}function yt({delay:t,isRunning:e,closeToast:a,type:r="default",hide:i,className:l,controlledProgress:o,progress:d,rtl:f,isIn:y,theme:_}){let k=i||o&&d===0,w={animationDuration:`${t}ms`,animationPlayState:e?"running":"paused"};o&&(w.transform=`scaleX(${d})`);let E=D("Toastify__progress-bar",o?"Toastify__progress-bar--controlled":"Toastify__progress-bar--animated",`Toastify__progress-bar-theme--${_}`,`Toastify__progress-bar--${r}`,{"Toastify__progress-bar--rtl":f}),C=P(l)?l({rtl:f,type:r,defaultClassName:E}):D(E,l),T={[o&&d>=1?"onTransitionEnd":"onAnimationEnd"]:o&&d<1?null:()=>{y&&a()}};return b.createElement("div",{className:"Toastify__progress-bar--wrp","data-hidden":k},b.createElement("div",{className:`Toastify__progress-bar--bg Toastify__progress-bar-theme--${_} Toastify__progress-bar--${r}`}),b.createElement("div",{role:"progressbar","aria-hidden":k?"true":"false","aria-label":"notification timer","aria-valuenow":o?Math.round(d*100):void 0,"aria-valuemin":0,"aria-valuemax":100,className:C,style:w,...T}))}var mt=1,at=()=>`${mt++}`;function pt(t,e,a){let r=1,i=0,l=[],o=[],d=e,f=new Map,y=new Set,_=s=>(y.add(s),()=>y.delete(s)),k=()=>{o=Array.from(f.values()),y.forEach(s=>s())},w=({containerId:s,toastId:n,updateId:c})=>{let x=s?s!==t:t!==1,L=f.has(n)&&c==null;return x||L},E=(s,n)=>{f.forEach(c=>{var x;(n==null||n===c.props.toastId)&&((x=c.toggle)==null||x.call(c,s))})},C=s=>{var n,c;s.isActive&&((c=(n=s.props)==null?void 0:n.onClose)==null||c.call(n,s.removalReason),s.isActive=!1,a(J(s,"removed")))},T=s=>{if(s==null)f.forEach(C);else{let n=f.get(s);n&&C(n)}k()},p=()=>{i-=l.length,l=[]},m=s=>{var n,c;let{toastId:x,updateId:L}=s.props,u=L==null;s.staleId&&f.delete(s.staleId),s.isActive=!0,f.set(x,s),k(),a(J(s,u?"added":"updated")),u&&((c=(n=s.props).onOpen)==null||c.call(n))};return{id:t,props:d,observe:_,toggle:E,removeToast:T,toasts:f,clearQueue:p,buildToast:(s,n)=>{if(w(n))return;let{toastId:c,updateId:x,data:L,staleId:u,delay:v}=n,O=x==null;O&&i++;let z={...d,style:d.toastStyle,key:r++,...Object.fromEntries(Object.entries(n).filter(([B,R])=>R!=null)),toastId:c,updateId:x,data:L,isIn:!1,className:Q(n.className||d.toastClassName),progressClassName:Q(n.progressClassName||d.progressClassName),autoClose:n.isLoading?!1:ct(n.autoClose,d.autoClose),closeToast(B){let R=f.get(c);R&&(R.removalReason=B,T(c))},deleteToast(){if(f.get(c)!=null){if(f.delete(c),i--,i<0&&(i=0),l.length>0){m(l.shift());return}k()}}};z.closeButton=d.closeButton,n.closeButton===!1||V(n.closeButton)?z.closeButton=n.closeButton:n.closeButton===!0&&(z.closeButton=V(d.closeButton)?d.closeButton:!0);let $={content:s,props:z,staleId:u};d.limit&&d.limit>0&&i>d.limit&&O?l.push($):M(v)?setTimeout(()=>{m($)},v):m($)},setProps(s){d=s},setToggle:(s,n)=>{let c=f.get(s);c&&(c.toggle=n)},isToastActive:s=>{var n;return(n=f.get(s))==null?void 0:n.isActive},getSnapshot:()=>o}}var I=new Map,N=[],W=new Set,_t=t=>W.forEach(e=>e(t)),ot=()=>I.size>0;function gt(){N.forEach(t=>rt(t.content,t.options)),N=[]}var vt=(t,{containerId:e})=>{var a;return(a=I.get(e||1))==null?void 0:a.toasts.get(t)};function st(t,e){var a;if(e)return!!((a=I.get(e))!=null&&a.isToastActive(t));let r=!1;return I.forEach(i=>{i.isToastActive(t)&&(r=!0)}),r}function bt(t){if(!ot()){N=N.filter(e=>t!=null&&e.options.toastId!==t);return}if(t==null||ft(t))I.forEach(e=>{e.removeToast(t)});else if(t&&("containerId"in t||"id"in t)){let e=I.get(t.containerId);e?e.removeToast(t.id):I.forEach(a=>{a.removeToast(t.id)})}}var Tt=(t={})=>{I.forEach(e=>{e.props.limit&&(!t.containerId||e.id===t.containerId)&&e.clearQueue()})};function rt(t,e){V(t)&&(ot()||N.push({content:t,options:e}),I.forEach(a=>{a.buildToast(t,e)}))}function ht(t){var e;(e=I.get(t.containerId||1))==null||e.setToggle(t.id,t.fn)}function it(t,e){I.forEach(a=>{(e==null||!(e!=null&&e.containerId)||e?.containerId===a.id)&&a.toggle(t,e?.id)})}function xt(t){let e=t.containerId||1;return{subscribe(a){let r=pt(e,t,_t);I.set(e,r);let i=r.observe(a);return gt(),()=>{i(),I.delete(e)}},setProps(a){var r;(r=I.get(e))==null||r.setProps(a)},getSnapshot(){var a;return(a=I.get(e))==null?void 0:a.getSnapshot()}}}function kt(t){return W.add(t),()=>{W.delete(t)}}function Et(t){return t&&(A(t.toastId)||M(t.toastId))?t.toastId:at()}function S(t,e){return rt(t,e),e.toastId}function H(t,e){return{...e,type:e&&e.type||t,toastId:Et(e)}}function F(t){return(e,a)=>S(e,H(t,a))}function g(t,e){return S(t,H("default",e))}g.loading=(t,e)=>S(t,H("default",{isLoading:!0,autoClose:!1,closeOnClick:!1,closeButton:!1,draggable:!1,...e}));function wt(t,{pending:e,error:a,success:r},i){let l;e&&(l=A(e)?g.loading(e,i):g.loading(e.render,{...i,...e}));let o={isLoading:null,autoClose:null,closeOnClick:null,closeButton:null,draggable:null},d=(y,_,k)=>{if(_==null){g.dismiss(l);return}let w={type:y,...o,...i,data:k},E=A(_)?{render:_}:_;return l?g.update(l,{...w,...E}):g(E.render,{...w,...E}),k},f=P(t)?t():t;return f.then(y=>d("success",r,y)).catch(y=>d("error",a,y)),f}g.promise=wt;g.success=F("success");g.info=F("info");g.error=F("error");g.warning=F("warning");g.warn=g.warning;g.dark=(t,e)=>S(t,H("default",{theme:"dark",...e}));function It(t){bt(t)}g.dismiss=It;g.clearWaitingQueue=Tt;g.isActive=st;g.update=(t,e={})=>{let a=vt(t,e);if(a){let{props:r,content:i}=a,l={delay:100,...r,...e,toastId:e.toastId||t,updateId:at()};l.toastId!==t&&(l.staleId=t);let o=l.render||i;delete l.render,S(o,l)}};g.done=t=>{g.update(t,{progress:1})};g.onChange=kt;g.play=t=>it(!0,t);g.pause=t=>it(!1,t);function Ct(t){var e;let{subscribe:a,getSnapshot:r,setProps:i}=h.useRef(xt(t)).current;i(t);let l=(e=h.useSyncExternalStore(a,r,r))==null?void 0:e.slice();function o(d){if(!l)return[];let f=new Map;return t.newestOnTop&&l.reverse(),l.forEach(y=>{let{position:_}=y.props;f.has(_)||f.set(_,[]),f.get(_).push(y)}),Array.from(f,y=>d(y[0],y[1]))}return{getToastToRender:o,isToastActive:st,count:l?.length}}function Lt(t){let[e,a]=h.useState(!1),[r,i]=h.useState(!1),l=h.useRef(null),o=h.useRef({start:0,delta:0,removalDistance:0,canCloseOnClick:!0,canDrag:!1,didMove:!1}).current,{autoClose:d,pauseOnHover:f,closeToast:y,onClick:_,closeOnClick:k}=t;ht({id:t.toastId,containerId:t.containerId,fn:a}),h.useEffect(()=>{if(t.pauseOnFocusLoss)return w(),()=>{E()}},[t.pauseOnFocusLoss]);function w(){document.hasFocus()||m(),window.addEventListener("focus",p),window.addEventListener("blur",m)}function E(){window.removeEventListener("focus",p),window.removeEventListener("blur",m)}function C(u){if(t.draggable===!0||t.draggable===u.pointerType){s();let v=l.current;o.canCloseOnClick=!0,o.canDrag=!0,v.style.transition="none",t.draggableDirection==="x"?(o.start=u.clientX,o.removalDistance=v.offsetWidth*(t.draggablePercent/100)):(o.start=u.clientY,o.removalDistance=v.offsetHeight*(t.draggablePercent===80?t.draggablePercent*1.5:t.draggablePercent)/100)}}function T(u){let{top:v,bottom:O,left:z,right:$}=l.current.getBoundingClientRect();u.pointerType==="mouse"&&t.pauseOnHover&&u.clientX>=z&&u.clientX<=$&&u.clientY>=v&&u.clientY<=O?m():p()}function p(){a(!0)}function m(){a(!1)}function s(){o.didMove=!1,document.addEventListener("pointermove",c),document.addEventListener("pointerup",x)}function n(){document.removeEventListener("pointermove",c),document.removeEventListener("pointerup",x)}function c(u){let v=l.current;if(o.canDrag&&v){o.didMove=!0,e&&m(),t.draggableDirection==="x"?o.delta=u.clientX-o.start:o.delta=u.clientY-o.start,o.start!==u.clientX&&(o.canCloseOnClick=!1);let O=t.draggableDirection==="x"?`${o.delta}px, var(--y)`:`0, calc(${o.delta}px + var(--y))`;v.style.transform=`translate3d(${O},0)`,v.style.opacity=`${1-Math.abs(o.delta/o.removalDistance)}`}}function x(){n();let u=l.current;if(o.canDrag&&o.didMove&&u){if(o.canDrag=!1,Math.abs(o.delta)>o.removalDistance){i(!0),t.closeToast(!0),t.collapseAll();return}u.style.transition="transform 0.2s, opacity 0.2s",u.style.removeProperty("transform"),u.style.removeProperty("opacity")}}let L={onPointerDown:C,onPointerUp:T};return d&&f&&(L.onMouseEnter=m,t.stacked||(L.onMouseLeave=p)),k&&(L.onClick=u=>{_&&_(u),o.canCloseOnClick&&y(!0)}),{playToast:p,pauseToast:m,isRunning:e,preventExitTransition:r,toastRef:l,eventHandlers:L}}var nt=typeof window<"u"?h.useLayoutEffect:h.useEffect,q=({theme:t,type:e,isLoading:a,...r})=>b.createElement("svg",{viewBox:"0 0 24 24",width:"100%",height:"100%",fill:t==="colored"?"currentColor":`var(--toastify-icon-color-${e})`,...r});function Ot(t){return b.createElement(q,{...t},b.createElement("path",{d:"M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.779-1.095h1.91c.528.005.84.476.784 1.1z"}))}function zt(t){return b.createElement(q,{...t},b.createElement("path",{d:"M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z"}))}function $t(t){return b.createElement(q,{...t},b.createElement("path",{d:"M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z"}))}function Pt(t){return b.createElement(q,{...t},b.createElement("path",{d:"M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z"}))}function Rt(){return b.createElement("div",{className:"Toastify__spinner"})}var j={info:zt,warning:Ot,success:$t,error:Pt,spinner:Rt},Dt=t=>t in j;function At({theme:t,type:e,isLoading:a,icon:r}){let i=null,l={theme:t,type:e};return r===!1||(P(r)?i=r({...l,isLoading:a}):h.isValidElement(r)?i=h.cloneElement(r,l):a?i=j.spinner():Dt(e)&&(i=j[e](l))),i}var Nt=t=>{let{isRunning:e,preventExitTransition:a,toastRef:r,eventHandlers:i,playToast:l}=Lt(t),{closeButton:o,children:d,autoClose:f,onClick:y,type:_,hideProgressBar:k,closeToast:w,transition:E,position:C,className:T,style:p,progressClassName:m,updateId:s,role:n,progress:c,rtl:x,toastId:L,deleteToast:u,isIn:v,isLoading:O,closeOnClick:z,theme:$,ariaLabel:B}=t,R=D("Toastify__toast",`Toastify__toast-theme--${$}`,`Toastify__toast--${_}`,{"Toastify__toast--rtl":x},{"Toastify__toast--close-on-click":z}),lt=P(T)?T({rtl:x,position:C,type:_,defaultClassName:R}):D(R,T),G=At(t),Z=!!c||!f,Y={closeToast:w,type:_,theme:$},X=null;return o===!1||(P(o)?X=o(Y):h.isValidElement(o)?X=h.cloneElement(o,Y):X=ut(Y)),b.createElement(E,{isIn:v,done:u,position:C,preventExitTransition:a,nodeRef:r,playToast:l},b.createElement("div",{id:L,tabIndex:0,onClick:y,"data-in":v,className:lt,...i,style:p,ref:r,...v&&{role:n,"aria-label":B}},G!=null&&b.createElement("div",{className:D("Toastify__toast-icon",{"Toastify--animate-icon Toastify__zoom-enter":!O})},G),et(d,t,!e),X,!t.customProgressBar&&b.createElement(yt,{...s&&!Z?{key:`p-${s}`}:{},rtl:x,theme:$,delay:f,isRunning:e,isIn:v,closeToast:w,hide:k,type:_,className:m,controlledProgress:Z,progress:c||0})))},K=(t,e=!1)=>({enter:`Toastify--animate Toastify__${t}-enter`,exit:`Toastify--animate Toastify__${t}-exit`,appendPosition:e}),Mt=U(K("bounce",!0)),qt=U(K("slide",!0)),Kt=U(K("zoom")),Yt=U(K("flip")),St={position:"top-right",transition:Mt,autoClose:5e3,closeButton:!0,pauseOnHover:!0,pauseOnFocusLoss:!0,draggable:"touch",draggablePercent:80,draggableDirection:"x",role:"alert",theme:"light","aria-label":"Notifications Alt+T",hotKeys:t=>t.altKey&&t.code==="KeyT"};function Bt(t){let e={...St,...t},a=t.stacked,[r,i]=h.useState(!0),l=h.useRef(null),{getToastToRender:o,isToastActive:d,count:f}=Ct(e),{className:y,style:_,rtl:k,containerId:w,hotKeys:E}=e;function C(p){let m=D("Toastify__toast-container",`Toastify__toast-container--${p}`,{"Toastify__toast-container--rtl":k});return P(y)?y({position:p,rtl:k,defaultClassName:m}):D(m,Q(y))}function T(){a&&(i(!0),g.play())}return nt(()=>{var p;if(a){let m=l.current.querySelectorAll('[data-in="true"]'),s=12,n=(p=e.position)==null?void 0:p.includes("top"),c=0,x=0;Array.from(m).reverse().forEach((L,u)=>{let v=L;v.classList.add("Toastify__toast--stacked"),u>0&&(v.dataset.collapsed=`${r}`),v.dataset.pos||(v.dataset.pos=n?"top":"bot");let O=c*(r?.2:1)+(r?0:s*u),z=Math.max(.5,1-(r?x:0));v.style.setProperty("--y",`${n?O:O*-1}px`),v.style.setProperty("--g",`${s}`),v.style.setProperty("--s",`${z}`),c+=v.offsetHeight,x+=.025})}},[r,f,a]),h.useEffect(()=>{function p(m){var s;let n=l.current;E(m)&&((s=n?.querySelector('[tabIndex="0"]'))==null||s.focus(),i(!1),g.pause()),m.key==="Escape"&&(document.activeElement===n||n!=null&&n.contains(document.activeElement))&&(i(!0),g.play())}return document.addEventListener("keydown",p),()=>{document.removeEventListener("keydown",p)}},[E]),b.createElement("section",{ref:l,className:"Toastify",id:w,onMouseEnter:()=>{a&&(i(!1),g.pause())},onMouseLeave:T,"aria-live":"polite","aria-atomic":"false","aria-relevant":"additions text","aria-label":e["aria-label"]},o((p,m)=>{let s=m.length?{..._}:{..._,pointerEvents:"none"};return b.createElement("div",{tabIndex:-1,className:C(p),"data-stacked":a,style:s,key:`c-${p}`},m.map(({content:n,props:c})=>b.createElement(Nt,{...c,stacked:a,collapseAll:T,isIn:d(c.toastId,c.containerId),key:`t-${c.key}`},n)))}))}var Xt=`:root {
  --toastify-color-light: #fff;
  --toastify-color-dark: #121212;
  --toastify-color-info: #3498db;
  --toastify-color-success: #07bc0c;
  --toastify-color-warning: #f1c40f;
  --toastify-color-error: hsl(6, 78%, 57%);
  --toastify-color-transparent: rgba(255, 255, 255, 0.7);

  --toastify-icon-color-info: var(--toastify-color-info);
  --toastify-icon-color-success: var(--toastify-color-success);
  --toastify-icon-color-warning: var(--toastify-color-warning);
  --toastify-icon-color-error: var(--toastify-color-error);

  --toastify-container-width: fit-content;
  --toastify-toast-width: 320px;
  --toastify-toast-offset: 16px;
  --toastify-toast-top: max(var(--toastify-toast-offset), env(safe-area-inset-top));
  --toastify-toast-right: max(var(--toastify-toast-offset), env(safe-area-inset-right));
  --toastify-toast-left: max(var(--toastify-toast-offset), env(safe-area-inset-left));
  --toastify-toast-bottom: max(var(--toastify-toast-offset), env(safe-area-inset-bottom));
  --toastify-toast-background: #fff;
  --toastify-toast-padding: 14px;
  --toastify-toast-min-height: 64px;
  --toastify-toast-max-height: 800px;
  --toastify-toast-bd-radius: 6px;
  --toastify-toast-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  --toastify-font-family: sans-serif;
  --toastify-z-index: 9999;
  --toastify-text-color-light: #757575;
  --toastify-text-color-dark: #fff;

  /* Used only for colored theme */
  --toastify-text-color-info: #fff;
  --toastify-text-color-success: #fff;
  --toastify-text-color-warning: #fff;
  --toastify-text-color-error: #fff;

  --toastify-spinner-color: #616161;
  --toastify-spinner-color-empty-area: #e0e0e0;
  --toastify-color-progress-light: linear-gradient(to right, #4cd964, #5ac8fa, #007aff, #34aadc, #5856d6, #ff2d55);
  --toastify-color-progress-dark: #bb86fc;
  --toastify-color-progress-info: var(--toastify-color-info);
  --toastify-color-progress-success: var(--toastify-color-success);
  --toastify-color-progress-warning: var(--toastify-color-warning);
  --toastify-color-progress-error: var(--toastify-color-error);
  /* used to control the opacity of the progress trail */
  --toastify-color-progress-bgo: 0.2;
}

.Toastify__toast-container {
  z-index: var(--toastify-z-index);
  -webkit-transform: translate3d(0, 0, var(--toastify-z-index));
  position: fixed;
  width: var(--toastify-container-width);
  box-sizing: border-box;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.Toastify__toast-container--top-left {
  top: var(--toastify-toast-top);
  left: var(--toastify-toast-left);
}
.Toastify__toast-container--top-center {
  top: var(--toastify-toast-top);
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}
.Toastify__toast-container--top-right {
  top: var(--toastify-toast-top);
  right: var(--toastify-toast-right);
  align-items: end;
}
.Toastify__toast-container--bottom-left {
  bottom: var(--toastify-toast-bottom);
  left: var(--toastify-toast-left);
}
.Toastify__toast-container--bottom-center {
  bottom: var(--toastify-toast-bottom);
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}
.Toastify__toast-container--bottom-right {
  bottom: var(--toastify-toast-bottom);
  right: var(--toastify-toast-right);
  align-items: end;
}

.Toastify__toast {
  --y: 0px;
  position: relative;
  touch-action: none;
  width: var(--toastify-toast-width);
  min-height: var(--toastify-toast-min-height);
  box-sizing: border-box;
  margin-bottom: 1rem;
  padding: var(--toastify-toast-padding);
  border-radius: var(--toastify-toast-bd-radius);
  box-shadow: var(--toastify-toast-shadow);
  max-height: var(--toastify-toast-max-height);
  font-family: var(--toastify-font-family);
  /* webkit only issue #791 */
  z-index: 0;
  /* inner swag */
  display: flex;
  flex: 1 auto;
  align-items: center;
  word-break: break-word;
}

@media only screen and (max-width: 480px) {
  .Toastify__toast-container {
    width: 100vw;
    left: env(safe-area-inset-left);
    margin: 0;
  }
  .Toastify__toast-container--top-left,
  .Toastify__toast-container--top-center,
  .Toastify__toast-container--top-right {
    top: env(safe-area-inset-top);
    transform: translateX(0);
  }
  .Toastify__toast-container--bottom-left,
  .Toastify__toast-container--bottom-center,
  .Toastify__toast-container--bottom-right {
    bottom: env(safe-area-inset-bottom);
    transform: translateX(0);
  }
  .Toastify__toast-container--rtl {
    right: env(safe-area-inset-right);
    left: initial;
  }
  .Toastify__toast {
    --toastify-toast-width: 100%;
    margin-bottom: 0;
    border-radius: 0;
  }
}

.Toastify__toast-container[data-stacked='true'] {
  width: var(--toastify-toast-width);
}

@media only screen and (max-width: 480px) {
  .Toastify__toast-container[data-stacked='true'] {
    width: 100vw;
  }
}

.Toastify__toast--stacked {
  position: absolute;
  width: 100%;
  transform: translate3d(0, var(--y), 0) scale(var(--s));
  transition: transform 0.3s;
}

.Toastify__toast--stacked[data-collapsed] .Toastify__toast-body,
.Toastify__toast--stacked[data-collapsed] .Toastify__close-button {
  transition: opacity 0.1s;
}

.Toastify__toast--stacked[data-collapsed='false'] {
  overflow: visible;
}

.Toastify__toast--stacked[data-collapsed='true']:not(:last-child) > * {
  opacity: 0;
}

.Toastify__toast--stacked:after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: calc(var(--g) * 1px);
  bottom: 100%;
}

.Toastify__toast--stacked[data-pos='top'] {
  top: 0;
}

.Toastify__toast--stacked[data-pos='bot'] {
  bottom: 0;
}

.Toastify__toast--stacked[data-pos='bot'].Toastify__toast--stacked:before {
  transform-origin: top;
}

.Toastify__toast--stacked[data-pos='top'].Toastify__toast--stacked:before {
  transform-origin: bottom;
}

.Toastify__toast--stacked:before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  transform: scaleY(3);
  z-index: -1;
}

.Toastify__toast--rtl {
  direction: rtl;
}

.Toastify__toast--close-on-click {
  cursor: pointer;
}

.Toastify__toast-icon {
  margin-inline-end: 10px;
  width: 22px;
  flex-shrink: 0;
  display: flex;
}

.Toastify--animate {
  animation-fill-mode: both;
  animation-duration: 0.5s;
}

.Toastify--animate-icon {
  animation-fill-mode: both;
  animation-duration: 0.3s;
}

.Toastify__toast-theme--dark {
  background: var(--toastify-color-dark);
  color: var(--toastify-text-color-dark);
}

.Toastify__toast-theme--light {
  background: var(--toastify-color-light);
  color: var(--toastify-text-color-light);
}

.Toastify__toast-theme--colored.Toastify__toast--default {
  background: var(--toastify-color-light);
  color: var(--toastify-text-color-light);
}

.Toastify__toast-theme--colored.Toastify__toast--info {
  color: var(--toastify-text-color-info);
  background: var(--toastify-color-info);
}

.Toastify__toast-theme--colored.Toastify__toast--success {
  color: var(--toastify-text-color-success);
  background: var(--toastify-color-success);
}

.Toastify__toast-theme--colored.Toastify__toast--warning {
  color: var(--toastify-text-color-warning);
  background: var(--toastify-color-warning);
}

.Toastify__toast-theme--colored.Toastify__toast--error {
  color: var(--toastify-text-color-error);
  background: var(--toastify-color-error);
}

.Toastify__progress-bar-theme--light {
  background: var(--toastify-color-progress-light);
}

.Toastify__progress-bar-theme--dark {
  background: var(--toastify-color-progress-dark);
}

.Toastify__progress-bar--info {
  background: var(--toastify-color-progress-info);
}

.Toastify__progress-bar--success {
  background: var(--toastify-color-progress-success);
}

.Toastify__progress-bar--warning {
  background: var(--toastify-color-progress-warning);
}

.Toastify__progress-bar--error {
  background: var(--toastify-color-progress-error);
}

.Toastify__progress-bar-theme--colored.Toastify__progress-bar--info,
.Toastify__progress-bar-theme--colored.Toastify__progress-bar--success,
.Toastify__progress-bar-theme--colored.Toastify__progress-bar--warning,
.Toastify__progress-bar-theme--colored.Toastify__progress-bar--error {
  background: var(--toastify-color-transparent);
}

.Toastify__close-button {
  color: #fff;
  position: absolute;
  top: 6px;
  right: 6px;
  background: transparent;
  outline: none;
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0.7;
  transition: 0.3s ease;
  z-index: 1;
}

.Toastify__toast--rtl .Toastify__close-button {
  left: 6px;
  right: unset;
}

.Toastify__close-button--light {
  color: #000;
  opacity: 0.3;
}

.Toastify__close-button > svg {
  fill: currentColor;
  height: 16px;
  width: 14px;
}

.Toastify__close-button:hover,
.Toastify__close-button:focus {
  opacity: 1;
}

@keyframes Toastify__trackProgress {
  0% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}

.Toastify__progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.7;
  transform-origin: left;
}

.Toastify__progress-bar--animated {
  animation: Toastify__trackProgress linear 1 forwards;
}

.Toastify__progress-bar--controlled {
  transition: transform 0.2s;
}

.Toastify__progress-bar--rtl {
  right: 0;
  left: initial;
  transform-origin: right;
  border-bottom-left-radius: initial;
}

.Toastify__progress-bar--wrp {
  position: absolute;
  overflow: hidden;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  border-bottom-left-radius: var(--toastify-toast-bd-radius);
  border-bottom-right-radius: var(--toastify-toast-bd-radius);
}

.Toastify__progress-bar--wrp[data-hidden='true'] {
  opacity: 0;
}

.Toastify__progress-bar--bg {
  opacity: var(--toastify-color-progress-bgo);
  width: 100%;
  height: 100%;
}

.Toastify__spinner {
  width: 20px;
  height: 20px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: var(--toastify-spinner-color-empty-area);
  border-right-color: var(--toastify-spinner-color);
  animation: Toastify__spin 0.65s linear infinite;
}

@keyframes Toastify__bounceInRight {
  from,
  60%,
  75%,
  90%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  from {
    opacity: 0;
    transform: translate3d(3000px, 0, 0);
  }
  60% {
    opacity: 1;
    transform: translate3d(-25px, 0, 0);
  }
  75% {
    transform: translate3d(10px, 0, 0);
  }
  90% {
    transform: translate3d(-5px, 0, 0);
  }
  to {
    transform: none;
  }
}

@keyframes Toastify__bounceOutRight {
  20% {
    opacity: 1;
    transform: translate3d(-20px, var(--y), 0);
  }
  to {
    opacity: 0;
    transform: translate3d(2000px, var(--y), 0);
  }
}

@keyframes Toastify__bounceInLeft {
  from,
  60%,
  75%,
  90%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  0% {
    opacity: 0;
    transform: translate3d(-3000px, 0, 0);
  }
  60% {
    opacity: 1;
    transform: translate3d(25px, 0, 0);
  }
  75% {
    transform: translate3d(-10px, 0, 0);
  }
  90% {
    transform: translate3d(5px, 0, 0);
  }
  to {
    transform: none;
  }
}

@keyframes Toastify__bounceOutLeft {
  20% {
    opacity: 1;
    transform: translate3d(20px, var(--y), 0);
  }
  to {
    opacity: 0;
    transform: translate3d(-2000px, var(--y), 0);
  }
}

@keyframes Toastify__bounceInUp {
  from,
  60%,
  75%,
  90%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  from {
    opacity: 0;
    transform: translate3d(0, 3000px, 0);
  }
  60% {
    opacity: 1;
    transform: translate3d(0, -20px, 0);
  }
  75% {
    transform: translate3d(0, 10px, 0);
  }
  90% {
    transform: translate3d(0, -5px, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes Toastify__bounceOutUp {
  20% {
    transform: translate3d(0, calc(var(--y) - 10px), 0);
  }
  40%,
  45% {
    opacity: 1;
    transform: translate3d(0, calc(var(--y) + 20px), 0);
  }
  to {
    opacity: 0;
    transform: translate3d(0, -2000px, 0);
  }
}

@keyframes Toastify__bounceInDown {
  from,
  60%,
  75%,
  90%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  0% {
    opacity: 0;
    transform: translate3d(0, -3000px, 0);
  }
  60% {
    opacity: 1;
    transform: translate3d(0, 25px, 0);
  }
  75% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, 5px, 0);
  }
  to {
    transform: none;
  }
}

@keyframes Toastify__bounceOutDown {
  20% {
    transform: translate3d(0, calc(var(--y) - 10px), 0);
  }
  40%,
  45% {
    opacity: 1;
    transform: translate3d(0, calc(var(--y) + 20px), 0);
  }
  to {
    opacity: 0;
    transform: translate3d(0, 2000px, 0);
  }
}

.Toastify__bounce-enter--top-left,
.Toastify__bounce-enter--bottom-left {
  animation-name: Toastify__bounceInLeft;
}

.Toastify__bounce-enter--top-right,
.Toastify__bounce-enter--bottom-right {
  animation-name: Toastify__bounceInRight;
}

.Toastify__bounce-enter--top-center {
  animation-name: Toastify__bounceInDown;
}

.Toastify__bounce-enter--bottom-center {
  animation-name: Toastify__bounceInUp;
}

.Toastify__bounce-exit--top-left,
.Toastify__bounce-exit--bottom-left {
  animation-name: Toastify__bounceOutLeft;
}

.Toastify__bounce-exit--top-right,
.Toastify__bounce-exit--bottom-right {
  animation-name: Toastify__bounceOutRight;
}

.Toastify__bounce-exit--top-center {
  animation-name: Toastify__bounceOutUp;
}

.Toastify__bounce-exit--bottom-center {
  animation-name: Toastify__bounceOutDown;
}

@keyframes Toastify__zoomIn {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  50% {
    opacity: 1;
  }
}

@keyframes Toastify__zoomOut {
  from {
    opacity: 1;
  }
  50% {
    opacity: 0;
    transform: translate3d(0, var(--y), 0) scale3d(0.3, 0.3, 0.3);
  }
  to {
    opacity: 0;
  }
}

.Toastify__zoom-enter {
  animation-name: Toastify__zoomIn;
}

.Toastify__zoom-exit {
  animation-name: Toastify__zoomOut;
}

@keyframes Toastify__flipIn {
  from {
    transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
    animation-timing-function: ease-in;
    opacity: 0;
  }
  40% {
    transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
    animation-timing-function: ease-in;
  }
  60% {
    transform: perspective(400px) rotate3d(1, 0, 0, 10deg);
    opacity: 1;
  }
  80% {
    transform: perspective(400px) rotate3d(1, 0, 0, -5deg);
  }
  to {
    transform: perspective(400px);
  }
}

@keyframes Toastify__flipOut {
  from {
    transform: translate3d(0, var(--y), 0) perspective(400px);
  }
  30% {
    transform: translate3d(0, var(--y), 0) perspective(400px) rotate3d(1, 0, 0, -20deg);
    opacity: 1;
  }
  to {
    transform: translate3d(0, var(--y), 0) perspective(400px) rotate3d(1, 0, 0, 90deg);
    opacity: 0;
  }
}

.Toastify__flip-enter {
  animation-name: Toastify__flipIn;
}

.Toastify__flip-exit {
  animation-name: Toastify__flipOut;
}

@keyframes Toastify__slideInRight {
  from {
    transform: translate3d(110%, 0, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, var(--y), 0);
  }
}

@keyframes Toastify__slideInLeft {
  from {
    transform: translate3d(-110%, 0, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, var(--y), 0);
  }
}

@keyframes Toastify__slideInUp {
  from {
    transform: translate3d(0, 110%, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, var(--y), 0);
  }
}

@keyframes Toastify__slideInDown {
  from {
    transform: translate3d(0, -110%, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, var(--y), 0);
  }
}

@keyframes Toastify__slideOutRight {
  from {
    transform: translate3d(0, var(--y), 0);
  }
  to {
    visibility: hidden;
    transform: translate3d(110%, var(--y), 0);
  }
}

@keyframes Toastify__slideOutLeft {
  from {
    transform: translate3d(0, var(--y), 0);
  }
  to {
    visibility: hidden;
    transform: translate3d(-110%, var(--y), 0);
  }
}

@keyframes Toastify__slideOutDown {
  from {
    transform: translate3d(0, var(--y), 0);
  }
  to {
    visibility: hidden;
    transform: translate3d(0, 500px, 0);
  }
}

@keyframes Toastify__slideOutUp {
  from {
    transform: translate3d(0, var(--y), 0);
  }
  to {
    visibility: hidden;
    transform: translate3d(0, -500px, 0);
  }
}

.Toastify__slide-enter--top-left,
.Toastify__slide-enter--bottom-left {
  animation-name: Toastify__slideInLeft;
}

.Toastify__slide-enter--top-right,
.Toastify__slide-enter--bottom-right {
  animation-name: Toastify__slideInRight;
}

.Toastify__slide-enter--top-center {
  animation-name: Toastify__slideInDown;
}

.Toastify__slide-enter--bottom-center {
  animation-name: Toastify__slideInUp;
}

.Toastify__slide-exit--top-left,
.Toastify__slide-exit--bottom-left {
  animation-name: Toastify__slideOutLeft;
  animation-timing-function: ease-in;
  animation-duration: 0.3s;
}

.Toastify__slide-exit--top-right,
.Toastify__slide-exit--bottom-right {
  animation-name: Toastify__slideOutRight;
  animation-timing-function: ease-in;
  animation-duration: 0.3s;
}

.Toastify__slide-exit--top-center {
  animation-name: Toastify__slideOutUp;
  animation-timing-function: ease-in;
  animation-duration: 0.3s;
}

.Toastify__slide-exit--bottom-center {
  animation-name: Toastify__slideOutDown;
  animation-timing-function: ease-in;
  animation-duration: 0.3s;
}

@keyframes Toastify__spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`,tt=new Map,Ut=(t,e)=>{nt(()=>{if(typeof document>"u")return;let a=document,r=tt.get(a);if(r){e&&r.setAttribute("nonce",e);return}let i=a.createElement("style");i.textContent=t,e&&i.setAttribute("nonce",e),a.head.appendChild(i),tt.set(a,i)},[e])};function Qt(t){return Ut(Xt,t.nonce),b.createElement(Bt,{...t})}export{Mt as Bounce,Yt as Flip,j as Icons,qt as Slide,Qt as ToastContainer,Kt as Zoom,dt as collapseToast,U as cssTransition,g as toast};
