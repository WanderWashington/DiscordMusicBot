interface VoiceControllerInterface {

}

export default class VoiceController implements VoiceControllerInterface {
    execute(): void {
        console.log("oi!");
    }
}