(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[796],{2948:e=>{"use strict";e.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"},3203:(e,t,r)=>{"use strict";r.d(t,{default:()=>D});var n=r(5155),o=r(2115);let a=(0,o.createContext)(null),i={didCatch:!1,error:null};class l extends o.Component{static getDerivedStateFromError(e){return{didCatch:!0,error:e}}resetErrorBoundary(){let{error:e}=this.state;if(null!==e){for(var t,r,n=arguments.length,o=Array(n),a=0;a<n;a++)o[a]=arguments[a];null==(t=(r=this.props).onReset)||t.call(r,{args:o,reason:"imperative-api"}),this.setState(i)}}componentDidCatch(e,t){var r,n;null==(r=(n=this.props).onError)||r.call(n,e,t)}componentDidUpdate(e,t){let{didCatch:r}=this.state,{resetKeys:n}=this.props;if(r&&null!==t.error&&function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];return e.length!==t.length||e.some((e,r)=>!Object.is(e,t[r]))}(e.resetKeys,n)){var o,a;null==(o=(a=this.props).onReset)||o.call(a,{next:n,prev:e.resetKeys,reason:"keys"}),this.setState(i)}}render(){let{children:e,fallbackRender:t,FallbackComponent:r,fallback:n}=this.props,{didCatch:i,error:l}=this.state,s=e;if(i){let e={error:l,resetErrorBoundary:this.resetErrorBoundary};if("function"==typeof t)s=t(e);else if(r)s=(0,o.createElement)(r,e);else if(void 0!==n)s=n;else throw l}return(0,o.createElement)(a.Provider,{value:{didCatch:i,error:l,resetErrorBoundary:this.resetErrorBoundary}},s)}constructor(e){super(e),this.resetErrorBoundary=this.resetErrorBoundary.bind(this),this.state=i}}let s="http://localhost".replace(/\/+$/,"");class c{set config(e){this.configuration=e}get basePath(){return null!=this.configuration.basePath?this.configuration.basePath:s}get fetchApi(){return this.configuration.fetchApi}get middleware(){return this.configuration.middleware||[]}get queryParamsStringify(){return this.configuration.queryParamsStringify||function e(t){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";return Object.keys(t).map(n=>(function t(r,n){let o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"",a=o+(o.length?"[".concat(r,"]"):r);if(n instanceof Array){let e=n.map(e=>encodeURIComponent(String(e))).join("&".concat(encodeURIComponent(a),"="));return"".concat(encodeURIComponent(a),"=").concat(e)}return n instanceof Set?t(r,Array.from(n),o):n instanceof Date?"".concat(encodeURIComponent(a),"=").concat(encodeURIComponent(n.toISOString())):n instanceof Object?e(n,a):"".concat(encodeURIComponent(a),"=").concat(encodeURIComponent(String(n)))})(n,t[n],r)).filter(e=>e.length>0).join("&")}}get username(){return this.configuration.username}get password(){return this.configuration.password}get apiKey(){let e=this.configuration.apiKey;if(e)return"function"==typeof e?e:()=>e}get accessToken(){let e=this.configuration.accessToken;if(e)return"function"==typeof e?e:async()=>e}get headers(){return this.configuration.headers}get credentials(){return this.configuration.credentials}constructor(e={}){this.configuration=e}}let u=new c;class d{withMiddleware(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];let n=this.clone();return n.middleware=n.middleware.concat(...t),n}withPreMiddleware(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];let n=t.map(e=>({pre:e}));return this.withMiddleware(...n)}withPostMiddleware(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];let n=t.map(e=>({post:e}));return this.withMiddleware(...n)}isJsonMime(e){return!!e&&d.jsonRegex.test(e)}async request(e,t){let{url:r,init:n}=await this.createFetchParams(e,t),o=await this.fetchApi(r,n);if(o&&o.status>=200&&o.status<300)return o;throw new h(o,"Response returned an error code")}async createFetchParams(e,t){var r,n;let o,a=this.configuration.basePath+e.path;void 0!==e.query&&0!==Object.keys(e.query).length&&(a+="?"+this.configuration.queryParamsStringify(e.query));let i=Object.assign({},this.configuration.headers,e.headers);Object.keys(i).forEach(e=>void 0===i[e]?delete i[e]:{});let l={method:e.method,headers:i,body:e.body,credentials:this.configuration.credentials},s={...l,...await ("function"==typeof t?t:async()=>t)({init:l,context:e})};return r=s.body,o="undefined"!=typeof FormData&&r instanceof FormData||s.body instanceof URLSearchParams||(n=s.body,"undefined"!=typeof Blob&&n instanceof Blob)?s.body:this.isJsonMime(i["Content-Type"])?JSON.stringify(s.body):s.body,{url:a,init:{...s,body:o}}}clone(){let e=new this.constructor(this.configuration);return e.middleware=this.middleware.slice(),e}constructor(e=u){this.configuration=e,this.fetchApi=async(e,t)=>{let r,n={url:e,init:t};for(let e of this.middleware)e.pre&&(n=await e.pre({fetch:this.fetchApi,...n})||n);try{r=await (this.configuration.fetchApi||fetch)(n.url,n.init)}catch(e){for(let t of this.middleware)t.onError&&(r=await t.onError({fetch:this.fetchApi,url:n.url,init:n.init,error:e,response:r?r.clone():void 0})||r);if(void 0===r)if(e instanceof Error)throw new p(e,"The request failed and the interceptors did not return an alternative response");else throw e}for(let e of this.middleware)e.post&&(r=await e.post({fetch:this.fetchApi,url:n.url,init:n.init,response:r.clone()})||r);return r},this.middleware=e.middleware}}d.jsonRegex=RegExp("^(:?application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(:?;.*)?$","i");class h extends Error{constructor(e,t){super(t),this.response=e,this.name="ResponseError"}}class p extends Error{constructor(e,t){super(t),this.cause=e,this.name="FetchError"}}class f extends Error{constructor(e,t){super(t),this.field=e,this.name="RequiredError"}}class m{async value(){return this.transformer(await this.raw.json())}constructor(e,t=e=>e){this.raw=e,this.transformer=t}}function y(e){var t,r;return r=0,null==(t=e)?t:{language:t.language,text:t.text}}function g(e){var t,r;return r=0,null==(t=e)?t:{code:t.code,shortName:t.shortName}}function w(e){return function(e,t){var r,n,o,a,i,l,s,c;if(null==e)return e;return{comment:null==e.comment?void 0:e.comment.map(y),country:(r=e.country,n=0,null==r?r:{isoCode:r.isoCode}),id:e.id,name:e.name.map(y),nationwide:e.nationwide,regionalScope:null==e.regionalScope?void 0:(o=e.regionalScope,a=0,o),subdivisions:e.subdivisions.map(g),temporalScope:null==e.temporalScope?void 0:(i=e.temporalScope,l=0,i),type:(s=e.type,c=0,s)}}(e,0)}function v(e){return function(e,t){var r,n,o,a,i,l;if(null==e)return e;return{comment:null==e.comment?void 0:e.comment.map(y),endDate:new Date(e.endDate),id:e.id,name:e.name.map(y),nationwide:e.nationwide,regionalScope:null==e.regionalScope?void 0:(r=e.regionalScope,n=0,r),startDate:new Date(e.startDate),temporalScope:null==e.temporalScope?void 0:(o=e.temporalScope,a=0,o),type:(i=e.type,l=0,i)}}(e,0)}function b(e){var t,r;return r=0,null==(t=e)?t:{category:t.category.map(y),children:null==t.children?void 0:t.children.map(b),code:t.code,comment:t.comment.map(y),isoCode:null==t.isoCode?void 0:t.isoCode,name:t.name.map(y),officialLanguages:t.officialLanguages,shortName:t.shortName}}function C(e){return function(e){return(arguments.length>1&&void 0!==arguments[1]&&arguments[1],null==e)?e:{category:e.category.map(LocalizedTextToJSON),children:null==e.children?void 0:e.children.map(C),code:e.code,comment:e.comment.map(LocalizedTextToJSON),isoCode:e.isoCode,name:e.name.map(LocalizedTextToJSON),officialLanguages:e.officialLanguages,shortName:e.shortName}}(e,!1)}class x extends d{async publicHolidaysByDateGetRaw(e,t){if(null==e.date)throw new f("date",'Required parameter "date" was null or undefined when calling publicHolidaysByDateGet().');let r={};return null!=e.languageIsoCode&&(r.languageIsoCode=e.languageIsoCode),null!=e.date&&(r.date=e.date.toISOString().substring(0,10)),new m(await this.request({path:"/PublicHolidaysByDate",method:"GET",headers:{},query:r},t),e=>e.map(w))}async publicHolidaysByDateGet(e,t){let r=await this.publicHolidaysByDateGetRaw(e,t);return await r.value()}async publicHolidaysGetRaw(e,t){if(null==e.countryIsoCode)throw new f("countryIsoCode",'Required parameter "countryIsoCode" was null or undefined when calling publicHolidaysGet().');if(null==e.validFrom)throw new f("validFrom",'Required parameter "validFrom" was null or undefined when calling publicHolidaysGet().');if(null==e.validTo)throw new f("validTo",'Required parameter "validTo" was null or undefined when calling publicHolidaysGet().');let r={};return null!=e.countryIsoCode&&(r.countryIsoCode=e.countryIsoCode),null!=e.languageIsoCode&&(r.languageIsoCode=e.languageIsoCode),null!=e.validFrom&&(r.validFrom=e.validFrom.toISOString().substring(0,10)),null!=e.validTo&&(r.validTo=e.validTo.toISOString().substring(0,10)),null!=e.subdivisionCode&&(r.subdivisionCode=e.subdivisionCode),new m(await this.request({path:"/PublicHolidays",method:"GET",headers:{},query:r},t),e=>e.map(v))}async publicHolidaysGet(e,t){let r=await this.publicHolidaysGetRaw(e,t);return await r.value()}async schoolHolidaysByDateGetRaw(e,t){if(null==e.date)throw new f("date",'Required parameter "date" was null or undefined when calling schoolHolidaysByDateGet().');let r={};return null!=e.languageIsoCode&&(r.languageIsoCode=e.languageIsoCode),null!=e.date&&(r.date=e.date.toISOString().substring(0,10)),new m(await this.request({path:"/SchoolHolidaysByDate",method:"GET",headers:{},query:r},t),e=>e.map(w))}async schoolHolidaysByDateGet(e,t){let r=await this.schoolHolidaysByDateGetRaw(e,t);return await r.value()}async schoolHolidaysGetRaw(e,t){if(null==e.countryIsoCode)throw new f("countryIsoCode",'Required parameter "countryIsoCode" was null or undefined when calling schoolHolidaysGet().');if(null==e.validFrom)throw new f("validFrom",'Required parameter "validFrom" was null or undefined when calling schoolHolidaysGet().');if(null==e.validTo)throw new f("validTo",'Required parameter "validTo" was null or undefined when calling schoolHolidaysGet().');let r={};return null!=e.countryIsoCode&&(r.countryIsoCode=e.countryIsoCode),null!=e.languageIsoCode&&(r.languageIsoCode=e.languageIsoCode),null!=e.validFrom&&(r.validFrom=e.validFrom.toISOString().substring(0,10)),null!=e.validTo&&(r.validTo=e.validTo.toISOString().substring(0,10)),null!=e.subdivisionCode&&(r.subdivisionCode=e.subdivisionCode),new m(await this.request({path:"/SchoolHolidays",method:"GET",headers:{},query:r},t),e=>e.map(v))}async schoolHolidaysGet(e,t){let r=await this.schoolHolidaysGetRaw(e,t);return await r.value()}}let S=(0,o.createContext)(null),j=e=>{let{children:t}=e,r=(0,o.useMemo)(()=>new x(new c({basePath:"https://openholidaysapi.org"})),[]);return(0,n.jsx)(S.Provider,{value:r,children:t})},I=()=>{let e=(0,o.useContext)(S);if(!e)throw Error("useHolidaysApi must be used within a HolidaysApiProvider");return e},O=e=>{let{holidaysPromise:t}=e,r=(0,o.use)(t);return(0,n.jsx)("ul",{className:"mx-auto",children:null==r?void 0:r.map(e=>{var t;let{name:r,startDate:o,id:a}=e,i=null!=(t=r.find(e=>{let{language:t}=e;return"EN"===t}))?t:r[0];return(0,n.jsx)("li",{children:"".concat(o.toDateString()," - ").concat(i.text)},a)})})},E=e=>{let{error:t}=e;return(0,n.jsxs)("div",{role:"alert",children:[(0,n.jsx)("p",{children:"Something went wrong:"}),(0,n.jsx)("pre",{style:{color:"red"},children:t.message})]})},T=e=>{let{countriesPromise:t,initialCountryIsoCode:r,onCountrySelect:a}=e,i=(0,o.use)(t);if(!Array.isArray(i))throw Error("".concat(i.status," - ").concat(i.title));return(0,n.jsx)("select",{className:"bg-black",defaultValue:r,onChange:e=>{null==a||a(e.target.value)},children:null==i?void 0:i.map(e=>{let{isoCode:t,name:r}=e,[o]=r;return(0,n.jsx)("option",{value:t,children:o.text},t)})})},R=e=>{let{onCountrySelect:t,initialCountryIsoCode:r}=e,a=(0,o.useMemo)(()=>fetch("https://openholidaysapi.org/Countries",{headers:{Accept:"application/json"}}).then(e=>e.json()),[]);return(0,n.jsx)(l,{FallbackComponent:E,children:(0,n.jsx)(o.Suspense,{fallback:"Loading...",children:(0,n.jsx)(T,{initialCountryIsoCode:r,onCountrySelect:t,countriesPromise:a})})})},k=()=>{let e=I(),[t,r]=(0,o.useState)("DE"),a=(0,o.useMemo)(()=>e.publicHolidaysGet({countryIsoCode:t,validFrom:new Date(new Date().getFullYear(),0,1),validTo:new Date(new Date().getFullYear(),11,31)}),[e,t]);return(0,n.jsxs)("section",{className:"flex flex-col gap-4 min-h-64",children:[(0,n.jsx)(R,{initialCountryIsoCode:t,onCountrySelect:r}),(0,n.jsx)(l,{FallbackComponent:E,children:(0,n.jsx)(o.Suspense,{fallback:"Loading...",children:(0,n.jsx)(O,{holidaysPromise:a})})})]})},D=()=>(0,n.jsx)(j,{children:(0,n.jsx)(k,{})})},4081:(e,t,r)=>{"use strict";r.d(t,{default:()=>w});var n=r(5155),o=r(2115);let a=e=>{let{className:t="",...r}=e;return(0,n.jsx)("button",{...r,className:"".concat(t," border border-white p-2")})};var i=r(8637),l=r.n(i);function s(){return(s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}).apply(this,arguments)}var c=(0,o.forwardRef)(function(e,t){var r=e.color,n=e.size,a=void 0===n?24:n,i=function(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],!(t.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}(e,["color","size"]);return o.createElement("svg",s({ref:t,xmlns:"http://www.w3.org/2000/svg",width:a,height:a,viewBox:"0 0 24 24",fill:"none",stroke:void 0===r?"currentColor":r,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},i),o.createElement("polyline",{points:"23 4 23 10 17 10"}),o.createElement("polyline",{points:"1 20 1 14 7 14"}),o.createElement("path",{d:"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"}))});c.propTypes={color:l().string,size:l().oneOfType([l().string,l().number])},c.displayName="RefreshCw";let u=e=>60*e*1e3,d=e=>new Intl.DateTimeFormat("en-US",{minute:"numeric",second:"numeric"}).format(e),h=e=>{let{duration:t,actionsAfter:r,actionsBefore:i,label:l,onComplete:s}=e,[h,p]=(0,o.useState)(new Date(u(t))),[f,m]=(0,o.useState)(!1);(0,o.useEffect)(()=>{if(!f)return;let e=setInterval(()=>{p(e=>new Date(e.getTime()-1e3))},1e3);return()=>{clearInterval(e)}},[f]),(0,o.useEffect)(()=>{f&&0>=h.getTime()&&(m(!1),p(new Date(u(t))),null==s||s())},[t,h,s,f]);let y=()=>{m(!1)};return(0,n.jsxs)("div",{className:"border-white border-solid border max-w-md flex-1 flex flex-col items-center p-4 gap-y-2 rounded-sm",children:[(0,n.jsx)("h2",{children:d(h)}),(0,n.jsxs)("div",{className:"flex gap-x-2",children:[f&&(0,n.jsxs)(o.Fragment,{children:[i,(0,n.jsx)(a,{"aria-label":"restart",title:"restart",onClick:()=>{y(),p(new Date(u(t)))},children:(0,n.jsx)(c,{})}),(0,n.jsx)(a,{onClick:()=>{y()},children:"Pause"}),r]}),!f&&(0,n.jsx)(a,{onClick:()=>{m(!0)},children:"Start ".concat(l)})]})]})};function p(){return(p=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}).apply(this,arguments)}var f=(0,o.forwardRef)(function(e,t){var r=e.color,n=e.size,a=void 0===n?24:n,i=function(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],!(t.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}(e,["color","size"]);return o.createElement("svg",p({ref:t,xmlns:"http://www.w3.org/2000/svg",width:a,height:a,viewBox:"0 0 24 24",fill:"none",stroke:void 0===r?"currentColor":r,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},i),o.createElement("polygon",{points:"5 4 15 12 5 20 5 4"}),o.createElement("line",{x1:"19",y1:"5",x2:"19",y2:"19"}))});f.propTypes={color:l().string,size:l().oneOfType([l().string,l().number])},f.displayName="SkipForward";let m=[{label:"focus time",timeInMinutes:25},{label:"short break",timeInMinutes:5},{label:"long break",timeInMinutes:20}],y=m.length,g=Array.from({length:4},()=>m),w=()=>{let[e,t]=(0,o.useState)(0),[r,i]=(0,o.useState)(0),{label:l,timeInMinutes:s}=g[e][r],c=()=>{if(r===y-1){t((e+1)%4),i(0);return}i(r+1)};return(0,n.jsxs)("div",{className:"flex flex-col items-center gap-y-2 p-3",children:[(0,n.jsx)("h1",{children:"Session ".concat(e+1," of ").concat(4," (").concat(l,")")}),(0,n.jsx)(h,{duration:s,onComplete:c,label:l,actionsAfter:(0,n.jsx)(a,{onClick:c,children:(0,n.jsx)(f,{})})},"".concat(e,"-").concat(r))]})}},8501:(e,t,r)=>{Promise.resolve().then(r.bind(r,3203)),Promise.resolve().then(r.bind(r,4081))},8637:(e,t,r)=>{e.exports=r(9399)()},9399:(e,t,r)=>{"use strict";var n=r(2948);function o(){}function a(){}a.resetWarningCache=o,e.exports=function(){function e(e,t,r,o,a,i){if(i!==n){var l=Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw l.name="Invariant Violation",l}}function t(){return e}e.isRequired=e;var r={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:a,resetWarningCache:o};return r.PropTypes=r,r}}},e=>{var t=t=>e(e.s=t);e.O(0,[441,684,358],()=>t(8501)),_N_E=e.O()}]);