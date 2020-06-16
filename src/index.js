import { render } from 'solid-js/dom';
import { createSignal } from 'solid-js';
import './index.css';

const [path, setPath] = createSignal(location.pathname.substring(1), (a, b) => a === b);

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
/*
		<Router fallback="not found">
			<Route path="/"><Home /></Route>
			<Route path="/cart/"><Cart /></Route>

			<Route path="/user/">aggregate and edit? link to user/:uid to edit (form view) as well</Route>
			<Route path="/user/:uid(\\d+)?">view and edit user profile if logged in</Route>
			<Route path="/user/:uid(\\d+)?/reservation/"><User_Reservations /></Route>

			<Route path="/store/"><Stores /></Route>
			<Route path="/store/new"><CreateStore /></Route>
			<Route path="/store/edit">bulk / table edit of stores</Route>
			<Route path="/store/reservation/">super aggregated stats to stroke ego</Route>
			<Route path="/store/:sid(\\d+){-:sslug}?/product/"><Store_Products /></Route>
			<Route path="/store/:sid(\\d+){-:sslug}?/edit">form here</Route>
			<Route path="/store/:sid(\\d+){-:sslug}?/reservation/"><Store_Reservations /></Route>
			<Route path="/store/:sid(\\d+){-:sslug}?/product/edit"><MenuItems />edit menu_items with link to /product "product not listed? click here"</Route>
			<Route path="/store/:sid(\\d+){-:sslug}?/product/new">if store owner, create product, default visible false, pending review by lobo</Route>
			<Route path="/store/:sid(\\d+){-:sslug}?/product/:pid(\\d+){-:pslug}?"><Store_Product /></Route>
			<Route path="/store/:sid(\\d+){-:sslug}?/review/"><Store_Reviews /></Route>

			<Route path="/product/"><Products /></Route>
			<Route path="/product/edit">bulk table edit if god</Route>
			<Route path="/product/new"><CreateProduct /></Route>
			<Route path="/product/:pid(\\d+){-:pslug}?"><Product /></Route>
			<Route path="/product/:pid(\\d+){-:pslug}?/edit">regular edit</Route>
		</Router>
see your own reservations (just need to be authorized)
see someone elses reservations
	if authorized 3, see
	else not allowed
*/
const [authorized, setAuthorized] = createSignal(0);//0 unauthorized, 1 store worker, 2 store owner, 3 god
function atHome() {return path().length === 0}
function atCart() {return path() === 'cart/'}
function atUser() {
	if(path().indexOf('user') === 0) {
		return path().substring(4);
	} else {
		return false;
	}
}
function atReservations() {
	let m = atUser().match(/^\/((?<id>\d+)(-(?<slug>[A-Za-z0-9_]+))?\/)?reservation\/$/);
	if(m === null) {
		return false;
	} else {
		return m.groups;
	}
}
function Reservations(props) {
	return <>
		<div>{props.id ?? 'your'} reservations</div>
		<table>
			<tbody>
				<tr>
					<td>The table body</td>
					<td>with two columns</td>
				</tr>
			</tbody>
		</table>
	</>
}
render(() => <>
	<a onClick={c} classList={{no: atHome()}} href='/'>home</a>
	<a onClick={c} classList={{no: atCart()}} href='/cart/'>cart</a>
	<a onClick={c} classList={{no: atUser()}} href='/user'>my profile</a>
	<input type="number" value={authorized()} onChange={e => setAuthorized(parseInt(e.target.value, 10))}/><br />
	<Switch fallback="not found">
		<Match when={atHome()}>some marketing shit</Match>
		<Match when={atCart()}>multicart</Match>

		<Match when={atUser() !== false}>
			<Switch fallback="not found">
				<Match when={atUser().length === 0}>
					<Switch fallback="not logged in">
						<Match when={authorized()}>
							<div>user edit email, password, etc</div>
							<div>genetic profile</div>
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
							<a onClick={c} href='/user/1'>1 profile</a>
							<a onClick={c} href='/user/2'>2 profile</a>
						</Match>
						<Match when={!authorized()}>
							not logged in
						</Match>
					</Switch>
				</Match>
				<Match when={atReservations()}>
					<Switch fallback="not allowed">
						<Match when={atReservations().id !== undefined && authorized() === 3 || atReservations().id === undefined}><Reservations id={atReservations().id}/></Match>
						<Match when={!authorized()}>
							not logged in
						</Match>
					</Switch>
				</Match>
			</Switch>
		</Match>
	</Switch>
</>, document.body);