public class AlphabeticalOrder {
    public static void main(String[] args) {
        char firstChar = 's';
        char secondChar = 'e';

        // Ensure both characters are in lowercase for consistent comparison
        firstChar = Character.toLowerCase(firstChar);
        secondChar = Character.toLowerCase(secondChar);

        if (firstChar < secondChar) {
            System.out.println(firstChar + "," + secondChar);
        } else {
            System.out.println(secondChar + "," + firstChar);
        }
    }
}
