import React from 'react';
interface IAboutModalProps {
    isModalShown: boolean;
    isCBioPortal: boolean;
    handleClose: Function;
}
export default class AboutModal extends React.Component<IAboutModalProps, {}> {
    constructor(props: IAboutModalProps);
    render(): JSX.Element;
}
export {};
