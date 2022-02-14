import { ILivechatAgent } from '../../../../definition/ILivechatAgent';
import { callbacks } from '../../../../lib/callbacks';
import { settings } from '../../../settings/server/index';
import { Users, LivechatDepartmentAgents } from '../../../models/server/index';
import { ILivechatDepartmentRecord } from '../../../../definition/ILivechatDepartmentRecord';

callbacks.add(
	'livechat.beforeDelegateAgent',
	(
		agent: ILivechatAgent,
		{ department }: { department?: ILivechatDepartmentRecord },
	): ILivechatAgent | { agentId: string; username: string } | null => {
		if (agent) {
			return agent;
		}

		if (!settings.get('Livechat_assign_new_conversation_to_bot')) {
			return null;
		}

		if (department) {
			return LivechatDepartmentAgents.getNextBotForDepartment(department);
		}

		return Users.getNextBotAgent();
	},
	callbacks.priority.HIGH,
	'livechat-before-delegate-agent',
);
