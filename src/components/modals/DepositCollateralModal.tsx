import {
    Modal,
    Group,
    Button,
    Anchor,
    TextInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from 'mantine-form-yup-resolver';
import * as yup from 'yup';
import { useDepositCollateral } from '@/api/agentVault';
import { useRouter } from 'next/router';
import { showErrorNotification, showSucessNotification } from '@/hooks/useNotifications';
import { AgentVault } from '@/types';

interface IDepositCollateralModal {
    opened: boolean;
    agentVault: AgentVault
    onClose: () => void;
}

export default function DepositCollateralModal({ opened, agentVault, onClose }: IDepositCollateralModal) {
    const depositCollateral = useDepositCollateral();
    const { t } = useTranslation();
    const router = useRouter();
    const { fAssetSymbol, agentVaultAddress } = router.query;

    const schema = yup.object().shape({
        amount: yup.number().required(t('validation.messages.required', { field: t('deposit_collateral_modal.deposit_amount_label', { vaultCollateralToken: agentVault.vaultCollateralToken }) }))
    });
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            amount: null,
        },
        validate: yupResolver(schema)
    });

    const onDepositCollateralSubmit = async(amount: number) => {
        const status = form.validate();
        if (status.hasErrors) return;

        try {
            await depositCollateral.mutateAsync({
                fAssetSymbol: fAssetSymbol,
                agentVaultAddress: agentVaultAddress,
                amount: amount
            });
            showSucessNotification(t('deposit_collateral_modal.success_message'));
            onClose();
        } catch (error) {
            if ((error as any).message) {
                showErrorNotification((error as any).response.data.message);
            } else {
                showErrorNotification(t('deposit_collateral_modal.error_message'));
            }
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t('deposit_collateral_modal.title')}
            closeOnClickOutside={!depositCollateral.isPending}
            closeOnEscape={!depositCollateral.isPending}
            centered
        >
            <form onSubmit={form.onSubmit(form => onDepositCollateralSubmit(form.amount))}>
                <TextInput
                    {...form.getInputProps('amount')}
                    label={t('deposit_collateral_modal.deposit_amount_label', { vaultCollateralToken: agentVault.vaultCollateralToken })}
                    description={t('deposit_collateral_modal.deposit_amount_description_label')}
                    placeholder={t('deposit_collateral_modal.deposit_amount_placeholder_label')}
                    withAsterisk
                />
                <Group justify="space-between" className="mt-5">
                    <Anchor
                        href="#"
                        target="_blank"
                        size="sm"
                        c="gray"
                    >
                        {t('deposit_collateral_modal.need_help_label')}
                    </Anchor>
                    <Button
                        type="submit"
                        loading={depositCollateral.isPending}
                    >
                        {t('deposit_collateral_modal.confirm_button')}
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
