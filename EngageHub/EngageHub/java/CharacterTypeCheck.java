public class CharacterTypeCheck {
    public static void main(String[] args) {
        char myChar = '@'; // Initialize your character here

        if (Character.isLetter(myChar)) {
            System.out.println("Alphabet");
        } else if (Character.isDigit(myChar)) {
            System.out.println("Digit");
        } else {
            System.out.println("Special Character");
        }
    }
}
