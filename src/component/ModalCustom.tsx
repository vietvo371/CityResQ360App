import { Modal, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { theme } from "../theme/colors";

interface ModalCustomProps {
    isModalVisible: boolean;
    setIsModalVisible: (isModalVisible: boolean) => void;
    title: string;
    children: React.ReactNode;
    isAction?: boolean;
    isClose?: boolean;
    onPressAction?: () => void;
}


const ModalCustom = ({ isModalVisible, setIsModalVisible, title, children, isAction = true, isClose = true , onPressAction }: ModalCustomProps) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                    </View>
                    
                    <View style={styles.modalBody}>
                        {children}
                    </View>

                    <View style={styles.modalFooter}>
                        {isClose && (
                                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.buttonClose}>
                                <Text style={styles.buttonText}>Đóng</Text>
                            </TouchableOpacity>
                        )}
                        {isAction && (
                            <TouchableOpacity 
                                onPress={() => {
                                    if (onPressAction) {
                                        onPressAction();
                                    }
                                    setIsModalVisible(false);
                                }} 
                                style={styles.buttonAction}
                            >
                                <Text style={styles.buttonText}>Thực Hiện</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '86%',
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: theme.spacing.lg,
    },
    modalHeader: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.sm,
    },
    modalTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.text,
        textAlign: 'center',
    },
    modalBody: {
        gap: theme.spacing.sm,
    },
    buttonClose: {
        width: '50%',
        padding: theme.spacing.sm,
        borderRadius: 10,
        backgroundColor: "#E5E5E5",
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonAction: {
        width: '50%',
        padding: theme.spacing.sm,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: theme.colors.black,
        fontSize: theme.typography.fontSize.md,
        fontFamily: theme.typography.fontFamily.bold,
    },
    modalFooter: {
        marginTop: theme.spacing.md,
        padding: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
});

export default ModalCustom;
