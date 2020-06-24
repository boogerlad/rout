import {onCleanup} from 'solid-js';
export function Reservations(props) {
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
export function Null(props) {
	console.log('Null')
	onCleanup(() => console.log('byenull'))
	return props.children;
}
export function Store(props) {
	console.log('store');
	onCleanup(() => console.log('byestore'))
	return <><div>store hours{props.id}</div>{props.children}</>
}
export function Product(props) {
	return <div>{props.id}</div>
}