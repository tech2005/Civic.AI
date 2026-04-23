public class InterestCalculator {
    public static void main(String[] args) {
        if (args.length != 2) {
            System.out.println("Usage: java InterestCalculator <gender> <age>");
            return;
        }

        String gender = args[0].toLowerCase();
        int age = Integer.parseInt(args[1]);

        double interestRate;

        if (gender.equals("female")) {
            if (age >= 1 && age <= 56) {
                interestRate = 8.25;
            } else if (age >= 59 && age <= 100) {
                interestRate = 9.2;
            } else {
                System.out.println("Invalid age for female.");
                return;
            }
        } else if (gender.equals("male")) {
            if (age >= 1 && age <= 58) {
                interestRate = 8.4;
            } else if (age >= 55 && age <= 100) {
                interestRate = 10.5;
            } else {
                System.out.println("Invalid age for male.");
                return;
            }
        } else {
            System.out.println("Invalid gender.");
            return;
        }

        System.out.println("Interest rate: " + interestRate + "%");
    }
}
