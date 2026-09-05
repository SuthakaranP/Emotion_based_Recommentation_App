package com.music.app;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Skipping context load test - requires running MySQL")
class AppApplicationTests {

	@Test
	void contextLoads() {
	}

}
