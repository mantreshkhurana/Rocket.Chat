import { escapeRegExp } from '@rocket.chat/string-helpers';
import { Users } from '@rocket.chat/models';
import type { ILivechatAgent, IPaginationOptions, IUser } from '@rocket.chat/core-typings';
import type { SortDirection } from 'mongodb';

/**
 * @param {IRole['_id']} role the role id
 * @param {string} text
 * @param {any} pagination
 */
async function findUsers<T = IUser>({
	text,
	role,
	pagination: { offset, count, sort },
}: {
	text: string | undefined;
	role: string;
	pagination: IPaginationOptions & { sort: { [K: string]: SortDirection } };
}) {
	const query = {};
	if (text) {
		const filterReg = new RegExp(escapeRegExp(text), 'i');
		Object.assign(query, {
			$or: [{ username: filterReg }, { name: filterReg }, { 'emails.address': filterReg }],
		});
	}

	const { cursor, totalCount } = Users.findPaginatedUsersInRolesWithQuery<T>([role], query, {
		sort: sort || { name: 1 },
		skip: offset,
		limit: count,
		projection: {
			username: 1,
			name: 1,
			status: 1,
			statusLivechat: 1,
			emails: 1,
			livechat: 1,
		},
	});

	const [users, total] = await Promise.all([cursor.toArray(), totalCount]);

	return {
		users,
		count: users.length,
		offset,
		total,
	};
}
export async function findAgents({
	text,
	pagination: { offset, count, sort },
}: {
	text: string | undefined;
	pagination: IPaginationOptions & {
		sort: {
			[k: string]: SortDirection;
		};
	};
}) {
	return findUsers<ILivechatAgent>({
		role: 'livechat-agent',
		text,
		pagination: {
			offset,
			count,
			sort,
		},
	});
}

export async function findManagers({
	text,
	pagination: { offset, count, sort },
}: {
	text: string | undefined;
	pagination: IPaginationOptions & { sort: { [k: string]: SortDirection } };
}) {
	return findUsers<ILivechatAgent>({
		role: 'livechat-manager',
		text,
		pagination: {
			offset,
			count,
			sort,
		},
	});
}
