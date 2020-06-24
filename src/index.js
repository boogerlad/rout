import { render } from 'solid-js/dom';
import { createSignal, createMemo } from 'solid-js';
import { Reservations, Null, Store, Product } from './components';
import './index.css';

const [path, setPath] = createSignal(location.pathname.substring(1), true);

onpopstate = function() {
	setPath(location.pathname.substring(1));
}

if(history.state === null) {
	history.replaceState({}, null);
}

function c(e) {
	e.preventDefault();
	history.pushState({}, null, e.target.href);
	setPath(location.pathname.substring(1));
}
window.setPath = setPath;
const [authorized, setAuthorized] = createSignal(0);//0 unauthorized, 1 store worker, 2 store owner, 3 god
function atHome() {return path().length === 0}
function atCart() {return path() === 'cart/'}
const reservationRegex = /^\/((?<id>\d+)\/)?reservation\/$/;
const spyRegex = /^\/(?<id>\d+)$/;
const commonRegex = /^((store\/(?<sid>\d+)(-(?<sslug>[A-Za-z0-9_]+))?\/(?<thing>product|review))|product)\/(?<rest>.*)$/;
const somethingRegex = /^(?<id>\d+)(-(?<slug>[A-Za-z0-9_]+))?(\/edit)?$/;
const atSpecificStoreRegex = /^(?<id>\d+)(-(?<slug>[A-Za-z0-9_]+))?\/(?<what>.+)/;

render(function() {
	const atUser = createMemo(() => path().indexOf('user') === 0 ? path().substring(4) : false, false, true);
	const atReservations = createMemo(() => {
		const a = atUser();
		if(a === false) {
			return undefined;
		} else {
			return a.match(reservationRegex)?.groups;
		}
	}, undefined, (a, b) => a === b || typeof a === 'object' && typeof b === 'object' && a.id === b.id);
	const spy = createMemo(() => {
		const a = atUser();
		if(a === false) {
			return undefined;
		} else {
			return a.match(spyRegex)?.groups;
		}
	}, undefined, (a, b) => a === b || typeof a === 'object' && typeof b === 'object' && a.id === b.id);
	const common = createMemo(() => path().match(commonRegex)?.groups, undefined, (a, b) => a === b || typeof a === 'object' && typeof b === 'object' && a.sid === b.sid && a.sslug === b.sslug && a.thing === b.thing && a.rest === b.rest);
	const something = createMemo(() => {
		const f = common();
		if(f === undefined) {
			return undefined;
		} else {
			return f.rest.match(somethingRegex)?.groups;
		}
	}, undefined, (a, b) => a === b || typeof a === 'object' && typeof b === 'object' && a.id === b.id && a.slug === b.slug);
	const atStore = createMemo(() => path().indexOf('store/') === 0 ? path().substring(6) : false, false, true);
	const atSpecificStore = createMemo(() => {
		const w = atStore();
		if(w === false) {
			return undefined;
		} else {
			return w.match(atSpecificStoreRegex)?.groups;
		}
	}, undefined, (a, b) => a === b || typeof a === 'object' && typeof b === 'object' && a.id === b.id && a.slug === b.slug && a.what === b.what);
	const parent = createMemo(() => common()?.sid === undefined || common()?.rest === 'new' || common()?.rest === 'edit' ? Null : Store, Null, true);
	return <>
		<a onClick={c} classList={{active: atHome()}} href='/'>home</a>
		<a onClick={c} classList={{active: atCart()}} href='/cart/'>cart</a>
		<a onClick={c} classList={{active: atUser() !== false}} href='/user'>my profile</a>
		<a onClick={c} classList={{active: atStore() !== false}} href='/store/'>stores</a>
		<a onClick={c} classList={{active: path().indexOf('product') === 0}} href='/product/'>products</a>
		<input type="number" value={authorized()} onChange={e => setAuthorized(parseInt(e.target.value, 10))}/><br />
		<Switch fallback="not found">
			<Match when={atHome()}>some marketing shit</Match>
			<Match when={atCart()}>multicart</Match>

			<Match when={atUser() !== false}>
				<Switch fallback="not found">
					<Match when={atUser().length === 0}>
						<Switch fallback="not logged in">
							<Match when={Boolean(authorized())}>
								<div>user edit email, password, etc</div>
								<div>genetic profile</div>
								<a onClick={c} href="/user/reservation/">your reservations</a>
								<Show when={authorized() === 3}>
									<a onClick={c} href="/user/">see all users</a>
								</Show>
							</Match>
						</Switch>
					</Match>
					<Match when={atUser() === '/'}>
						<Switch fallback="not allowed">
							<Match when={authorized() === 3}>
								all users table, current # of ws, current # signed in
								<a onClick={c} href='1'>1 profile</a>
								<a onClick={c} href='2'>2 profile</a>
							</Match>
							<Match when={!authorized()}>
								not logged in
							</Match>
						</Switch>
					</Match>
					<Match when={Boolean(atReservations())}>
						<Switch fallback="not allowed">
							<Match when={!authorized()}>
								not logged in
							</Match>
							<Match when={atReservations().id !== undefined && authorized() === 3 || atReservations().id === undefined}><Reservations id={atReservations().id}/></Match>
						</Switch>
					</Match>
					<Match when={Boolean(spy())}>
						<Switch fallback="not allowed">
							<Match when={authorized() === 3}>
								<div>{spy().id}'s profile</div>
								<div>genetic drop down edit</div>
								<div>genetic test history / fudgery</div>
								<a onClick={c} href={spy().id + '/reservation/'}>{spy().id}'s reservations</a>
							</Match>
							<Match when={authorized() === 0}>not logged in</Match>
						</Switch>
					</Match>
				</Switch>
			</Match>

			<Match when={Boolean(common())}>
				<Dynamic component={parent()} id={common()?.sid}>
					{/*@once*/<Switch fallback="not found">
						<Match when={common()?.thing === 'review' && common()?.rest.length === 0}>reviews</Match>
						<Match when={(common()?.thing === 'product' || common()?.sid === undefined)}>
							<Switch fallback="not found">
								<Match when={common()?.rest.length === 0}><input type="text" /></Match>
								<Match when={Boolean(something())}><Product id={something().id} />need switch</Match>
								<Match when={common()?.rest === 'new'}>new need switch</Match>
								<Match when={common()?.rest === 'edit'}>edit need switch</Match>
							</Switch>
						</Match>
					</Switch>}
				</Dynamic>
			</Match>

			<Match when={atStore() !== false}>
				<Switch fallback="not found">
					<Match when={atStore().length === 0}>
						stores component<br />
						<a onClick={c} href="1-nova/product/">nova</a>
						<a onClick={c} href="1-nova/review/">🌟🌟</a>
						<a onClick={c} href="2/product/">super</a>
						<a onClick={c} href="2/review/">🌟</a>
					</Match>
					<Match when={atStore() === 'new'}>
						<Switch fallback="not allowed">
							<Match when={authorized() === 3}>CreateStore component</Match>
							<Match when={authorized() === 0}>not logged in</Match>
						</Switch>
					</Match>
					<Match when={atStore() === 'edit'}>
						<Switch fallback="not allowed">
							<Match when={authorized() === 3}>bulk / table edit of stores</Match>
							<Match when={authorized() === 0}>not logged in</Match>
						</Switch>
					</Match>
					<Match when={atStore() === 'reservation/'}>
						<Switch fallback="not allowed">
							<Match when={authorized() === 3}>super aggregated stats to stroke ego</Match>
							<Match when={authorized() === 0}>not logged in</Match>
						</Switch>
					</Match>
					<Match when={Boolean(atSpecificStore())}>
						<Switch fallback="not found">
							<Match when={atSpecificStore().what === 'edit'}>
								<Switch fallback="not allowed">
									<Match when={authorized() === 3}>form here</Match>
									<Match when={authorized() === 0}>not logged in</Match>
								</Switch>
							</Match>
							<Match when={atSpecificStore().what === 'reservation/'}>
								<Switch fallback="not allowed">
									<Match when={authorized() === 3}>store_reservations id=atSpecificStore().id</Match>
									<Match when={authorized() === 0}>not logged in</Match>
								</Switch>
							</Match>
						</Switch>
					</Match>
				</Switch>
			</Match>
		</Switch>
	</>
}, document.body);