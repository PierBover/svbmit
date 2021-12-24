import ValidationController from "./ValidationController"


export default function (node, settings) {

    settings.form = node;

    const validationController = new ValidationController(settings);

	return {
		destroy () {
            validationController.destroy();
		}
	}
}